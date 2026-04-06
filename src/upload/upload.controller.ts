import { Controller, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import * as xlsx from 'xlsx';

@ApiTags('Uploads')
@Controller('upload')
export class UploadController {
  constructor(private readonly dataSource: DataSource) {}

  @Post('excel')
  @ApiOperation({ summary: 'Faz upload de um Excel e cria/alimenta tabela dinâmica' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Nenhum arquivo enviado.', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1. Lê o buffer do Excel
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Pega a primeira aba
      const sheet = workbook.Sheets[sheetName];

      // 2. Converte pra JSON arranjado por linhas
      // defval vazio para forçar as chaves a existirem mesmo que o valor da célula seja branco
      const data: Record<string, any>[] = xlsx.utils.sheet_to_json(sheet, { defval: null });

      if (data.length === 0) {
        throw new HttpException('Planilha vazia.', HttpStatus.BAD_REQUEST);
      }

      // 3. Obtém as colunas baseadas no título da primeira linha
      // Vamos higienizar o nome das colunas e da tabela
      const rawColumns = Object.keys(data[0]);
      
      const sanitizeName = (str: string) => {
        return str
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9]+/g, '_') // Troca espaços e chars estranhos por underscore
          .replace(/^_+|_+$/g, ''); // Remove underscores nas pontas
      };

      // Nome da tabela será o nome original do arquivo sanitizado (sem a extensão)
      const originalName = file.originalname.replace(/\.[^/.]+$/, ''); 
      const tableName = sanitizeName(originalName);

      // Sanitiza as colunas e prepara array pra query DDL
      // O Postgres entende TEXT dinamicamente bem
      const columns = rawColumns.map(col => sanitizeName(col));
      
      const columnDefinitions = columns.map(col => `"${col}" TEXT`).join(', ');

      // 4. Executa o DDL Dinâmico - CREATE TABLE IF NOT EXISTS
      // Usamos prefixos _uiengine_ nas colunas reservadas para evitar conflitos 
      // caso a planilha também tenha uma coluna chamada "id"
      const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (
        _uiengine_id SERIAL PRIMARY KEY,
        _uiengine_created_at TIMESTAMP DEFAULT NOW(),
        ${columnDefinitions}
      );`;

      await this.dataSource.query(createTableQuery);

      // 5. Gera os INSERTS
      // Uma transação ou múltiplos INSERTS batch (pra não explodir em tabelas grandes)
      let insertedCount = 0;
      for (const row of data) {
        // Pega os valores reais na ordem exata definida por 'rawColumns' 
        // pra mapear certinho pra 'columns'
        const values = rawColumns.map(rc => row[rc]?.toString() || null);
        
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders});`;
        
        await this.dataSource.query(insertQuery, values);
        insertedCount++;
      }

      return {
        message: 'Upload e processamento concluídos com sucesso!',
        tableName,
        insertedRows: insertedCount
      };

    } catch (e) {
      console.error(e);
      throw new HttpException(`Erro interno ao processar a planilha: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
