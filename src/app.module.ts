import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { SalesController } from './mock-services/sales.controller';
import { EventsController } from './mock-services/events.controller';
import { PharmacyController } from './mock-services/pharmacy.controller';
import { RentalController } from './mock-services/rental-erp.controller';

import { DatabaseModule } from './database/database.module';
import { UploadModule } from './upload/upload.module';
import { DynamicDataModule } from './dynamic-data/dynamic-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AiModule,
    DatabaseModule,
    UploadModule,
    DynamicDataModule
  ],
  controllers: [
    AppController,
    SalesController,
    EventsController,
    PharmacyController,
    RentalController,
  ],
  providers: [AppService],
})
export class AppModule {}
