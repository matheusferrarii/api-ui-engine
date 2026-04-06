import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'uiengine',
      autoLoadEntities: true,
      synchronize: true, // Auto-create schema for registered entities (we don't have static entities yet, but good for future)
    }),
  ],
})
export class DatabaseModule {}
