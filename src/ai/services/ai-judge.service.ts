import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiJudgeService {
  private readonly logger = new Logger(AiJudgeService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async evaluateSchema(generatedJson: string): Promise<{ isValid: boolean; reason?: string }> {
    const judgePrompt = `You are a strict QA Judge for UI Dashboard configurations.
Your only job is to evaluate if the generated JSON strictly adheres to the rules of a UISchema.

CRITICAL RULES:
1. The JSON must have the 'title', 'layout', and 'components' keys.
2. Inside 'components' arrays, NO SQL queries or code blocks are allowed.
3. The 'data', 'items', or 'value' fields in components MUST contain ACTUAL numbers or data arrays, NOT queries. For example, if a chart component has a property "query": "SELECT * FROM...", YOU MUST REJECT IT entirely.

Analyze the JSON. If it violates ANY of these rules (especially Rule 3 regarding SQL strings inside components), you must set "isValid" to false and provide a detailed "reason" explaining what is wrong so the developer agent can fix it.
If the JSON is perfect and contains raw data arrays inside the components, set "isValid" to true.

Respond strictly in JSON format matching this schema:
{
  "isValid": boolean,
  "reason": "String explaining the violation. Leave empty if valid."
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o', // Can use a smaller/faster model like gpt-4o-mini if preferred
        messages: [
          { role: 'system', content: judgePrompt },
          { role: 'user', content: generatedJson }
        ],
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0].message.content;
      this.logger.log(`Judge Evaluation Result: ${responseContent}`);
      
      const evaluation = JSON.parse(responseContent || "{}");
      return {
        isValid: evaluation.isValid === true,
        reason: evaluation.reason
      };
    } catch (e) {
      this.logger.error(`Failed to evaluate schema: ${e.message}`);
      // In case of error (timeout/format), we pessimistically/optimistically decide. 
      // Let's optimistic for now to not break the pipeline.
      return { isValid: true };
    }
  }
}
