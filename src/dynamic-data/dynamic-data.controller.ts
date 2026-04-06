import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AIQueryable } from '../ai/decorators/ai-queryable.decorator';
import { z } from 'zod';

@ApiTags('Dynamic Data AI')
@Controller('dynamic-data')
export class DynamicDataController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('schema')
  @ApiOperation({ summary: 'Lista todas as tabelas (planilhas) enviadas e suas estruturas' })
  @AIQueryable({
    description: 'Call this tool to discover what dynamic tables (spreadsheets) are available in the database and what columns they possess. Useful if the user asks for data from a spreadsheet they uploaded.',
    filters: z.object({}),
  })
  async listUploadedTables(): Promise<any> {
    const query = `
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name NOT IN ('migrations', 'typeorm_metadata')
      ORDER BY table_name;
    `;
    const result = await this.dataSource.query(query);
    
    // Agrupar por tabela
    const tables: Record<string, any[]> = {};
    for (const row of result) {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push({ col: row.column_name, type: row.data_type });
    }
    
    return tables;
  }

  @Get('query')
  @ApiOperation({ summary: 'Executa uma consulta SQL genérica restrita à leitura' })
  @AIQueryable({
    description: 'Execute a read-only RAW SQL query string to aggregate or fetch data from the databases discovered via listUploadedTables. Ex: SELECT count(*), cidade FROM dados_aleatorios GROUP BY cidade',
    filters: z.object({
      sqlQuery: z.string().describe('The strict raw SQL query to run against Postgres.'),
    }),
  })
  async executeDynamicQuery(@Query('sqlQuery') sqlQuery: string): Promise<any> {
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return { error: 'Apenas consultas SELECT de leitura permitidas por segurança.' };
    }
    try {
      const result = await this.dataSource.query(sqlQuery);
      return result;
    } catch (e) {
      return { error: 'Invalid SQL Query.', details: e.message };
    }
  }
}
