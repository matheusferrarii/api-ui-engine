import { SetMetadata } from '@nestjs/common';
import { z } from 'zod';

export const AI_QUERYABLE_KEY = 'ai_queryable';

export interface AIQueryableOptions {
  description: string;
  // Let the developer define inputs using Zod schema for better tool mapping
  // Or string array if it's just basic filters, but Zod is better for OpenAI tools
  filters?: z.ZodType<any>; 
}

export const AIQueryable = (options: AIQueryableOptions) =>
  SetMetadata(AI_QUERYABLE_KEY, options);
