import { Module } from '@nestjs/common';
import { DynamicDataController } from './dynamic-data.controller';

@Module({
  controllers: [DynamicDataController],
})
export class DynamicDataModule {}
