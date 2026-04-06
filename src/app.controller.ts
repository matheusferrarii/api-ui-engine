import { Body, Controller, Post, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiOrchestratorService } from './ai/services/ai-orchestrator.service';
import { ChatRequest } from './shared/ui-schema.model';
import type { UISchema } from './shared/ui-schema.model';
import { DataSource } from 'typeorm';

@ApiTags('Orchestrator')
@Controller('api')
export class AppController {
  constructor(
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly dataSource: DataSource
  ) {}

  @ApiOperation({ summary: 'Gera a interface dinâmica', description: 'Recebe o prompt em linguagem natural e orquestra as chamadas internas para entregar a estrutura JSON de tela (UISchema).' })
  @Post('chat')
  async chat(@Body() request: ChatRequest): Promise<UISchema> {
    return this.aiOrchestrator.handlePrompt(request);
  }

  @ApiOperation({ summary: 'Retorna os dados crus de uma tabela dinâmica do banco de dados para o frontend (Ex: /api/data/dados_aleatorios)' })
  @Get('data/:table')
  async getDynamicData(@Param('table') table: string): Promise<any> {
    const sanitizedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    try {
      // Retornamos um limite amigável para não sobrecarregar o request
      return await this.dataSource.query(`SELECT * FROM "${sanitizedTable}" LIMIT 1000`);
    } catch (e) {
      throw new HttpException(`Erro ao consultar a origem de dados fictícia ou tabela dinâmica ${sanitizedTable}.`, HttpStatus.NOT_FOUND);
    }
  }
}


