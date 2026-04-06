import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { AI_QUERYABLE_KEY, AIQueryableOptions } from '../decorators/ai-queryable.decorator';

export interface RegisteredAITool {
  name: string; // The function name
  description: string;
  filters?: any; // The zod schema or filter array
  instance: any; // The controller/service instance
  methodName: string; // The actual method to call
}

@Injectable()
export class AiMetadataScannerService implements OnModuleInit {
  private readonly aiTools = new Map<string, RegisteredAITool>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    this.explore();
  }

  private explore() {
    // Get all controllers and providers
    const wrappers = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ];

    wrappers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') {
        return;
      }

      // Scan all methods on the instance prototype
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (methodName: string) => {
          const methodRef = instance[methodName];
          if (typeof methodRef === 'function') {
            const metadata: AIQueryableOptions = this.reflector.get(
              AI_QUERYABLE_KEY,
              methodRef,
            );

            if (metadata) {
              // Ensure name is safe for OpenAI tool (alphanumeric and underscores)
              const toolName = `${wrapper.name}_${methodName}`
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .toLowerCase();

              this.aiTools.set(toolName, {
                name: toolName,
                description: metadata.description,
                filters: metadata.filters,
                instance: instance,
                methodName: methodName,
              });
            }
          }
        },
      );
    });
  }

  getTools(): RegisteredAITool[] {
    return Array.from(this.aiTools.values());
  }
}
