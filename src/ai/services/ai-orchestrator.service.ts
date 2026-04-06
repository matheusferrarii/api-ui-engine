import { Injectable, Logger } from '@nestjs/common';
import { AiMetadataScannerService } from './ai-metadata-scanner.service';
import OpenAI from 'openai';
import { zodFunction } from 'openai/helpers/zod';
import { z } from 'zod';
import { ChatRequest, UISchema } from '../../shared/ui-schema.model';

import { AiJudgeService } from './ai-judge.service';

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private openai: OpenAI;

  constructor(
    private readonly metadataScanner: AiMetadataScannerService,
    private readonly judgeService: AiJudgeService
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async handlePrompt(chatRequest: ChatRequest): Promise<UISchema> {
    const rawTools = this.metadataScanner.getTools();
    
    // Map registered endpoints to OpenAI tools
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = rawTools.map(
      (t) => {
        // If the developer provided a Zod schema for filters, use it. Otherwise, assume empty parameters.
        const parametersSchema = t.filters ? t.filters : z.object({});
        
        return zodFunction({
          name: t.name,
          parameters: parametersSchema,
          description: t.description,
        });
      },
    );

    const systemPrompt = `You are an AI Orchestrator that generates dynamic UI layouts.
The user wants to see certain data. You have access to backend functions (tools) to fetch the required data.
Once you fetch the necessary data, you MUST return a structured JSON conforming to the UISchema interface provided.

CRITICAL INSTRUCTION: You MUST use the tools to fetch data from the databases. DO NOT return SQL query strings inside the components. You MUST execute the queries using your tools, get the raw data arrays, and embed the ACTUAL DATA into the components' 'data', 'items', or 'value' fields.

Here is the context of what you should return:
interface UISchema {
  title: string;
  layout: 'grid' | 'flex' | 'stack';
  components: {
    type: 'chart' | 'kpi' | 'table' | 'list';
    title: string;
    description?: string;
    data?: any; // For charts. Put the EXACT RAW DATA array fetched from the tool here.
    rows?: any[]; // For tables.
    items?: any[]; // For lists.
    value?: string | number; // For KPIs.
  }[]; 
  sources?: { id: string, label: string, endpoint: string, recordCount?: number }[];
  description?: string;
}

Construct the dashboard using the retrieved context to inform values, records, and descriptions.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: chatRequest.prompt },
    ];

    if (chatRequest.context) {
      messages.push({ role: 'user', content: `Context string: ${chatRequest.context}` });
    }

    this.logger.log(`Calling OpenAI with ${tools.length} available tools`);

    // First API call
    const completion = await this.openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : 'none',
    });

    const responseMessage = completion.choices[0].message;

    // Check if the model wants to call functions
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      this.logger.log(`OpenAI requested to call ${responseMessage.tool_calls.length} tools`);
      
      messages.push(responseMessage); // Add the assistant's request to the messages array

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type !== 'function') continue;
        const functionName = toolCall.function.name;
        const rawArgs = toolCall.function.arguments;
        const args = JSON.parse(rawArgs);

        this.logger.log(`Calling internal tool [${functionName}] with args: ${rawArgs}`);

        // Find the matched tool
        const matchedTool = rawTools.find((t) => t.name === functionName);

        if (matchedTool) {
          // Execute the internal controller/service method dynamically
          let result;
          try {
            // Apply the extracted arguments
            result = await matchedTool.instance[matchedTool.methodName](args);
          } catch (e) {
            this.logger.error(`Error calling ${functionName}:`, e);
            result = { error: 'Failed to execute internal function' };
          }
          
          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: JSON.stringify(result),
          });
        } else {
          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: JSON.stringify({ error: `Function ${functionName} not found internally` }),
          });
        }
      }

      // Second API Call: send back the function responses and force structured output
      this.logger.log('Sending tool results back to OpenAI to generate final UISchema Layout...');
      
      let finalJson = "{}";
      let retries = 0;
      const MAX_RETRIES = 3;

      while (retries < MAX_RETRIES) {
        const finalCompletion = await this.openai.chat.completions.create({
          model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
          messages,
          response_format: { type: 'json_object' },
        });

        finalJson = finalCompletion.choices[0].message.content || "{}";
        
        // --- JUDGE EVALUATION --- //
        this.logger.log(`Evaluating generated schema (Attempt ${retries + 1}/${MAX_RETRIES})...`);
        const evaluation = await this.judgeService.evaluateSchema(finalJson);
        
        if (evaluation.isValid) {
          this.logger.log('QA Judge aprovou o JSON Schema!');
          break; // JSON is perfect, exit the retry reflex loop
        } else {
          this.logger.warn(`QA Judge REPROVOU o JSON gerado: ${evaluation.reason}`);
          
          // Actor-Critic: Push the critique to the context so the model acts upon it and regenerates
          messages.push({ role: 'assistant', content: finalJson });
          messages.push({ 
            role: 'user', 
            content: `CRITICAL SYSTEM FEEDBACK: The QA Judge REJECTED this generated UI JSON because of the following violations:\n"${evaluation.reason}"\n\nPlease fix the JSON completely and supply ONLY VALID RAW DATA inside the components arrays. NEVER supply RAW SQL inside the components. Try again.` 
          });
          retries++;
        }
      }

      return JSON.parse(finalJson) as UISchema;
    }

    // Fallback if no tools called
    if (responseMessage.content) {
      try {
        // Assume it returned JSON directly
        return JSON.parse(responseMessage.content) as UISchema;
      } catch(e) {
        // Fallback structure
        return {
          title: 'Not Generated Structure',
          layout: 'stack',
          components: [{ type: 'alert', title: 'Parse error', message: responseMessage.content, severity: 'error' }]
        } as UISchema;
      }
    }

    throw new Error('Failed to generate UI schema');
  }
}
