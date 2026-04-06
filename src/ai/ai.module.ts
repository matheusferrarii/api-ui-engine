import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AiMetadataScannerService } from './services/ai-metadata-scanner.service';
import { AiOrchestratorService } from './services/ai-orchestrator.service';
import { AiJudgeService } from './services/ai-judge.service';

@Module({
  imports: [DiscoveryModule],
  providers: [AiMetadataScannerService, AiOrchestratorService, AiJudgeService],
  exports: [AiOrchestratorService, AiJudgeService],
})
export class AiModule {}
