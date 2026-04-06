import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('UI Engine Orchestrator')
    .setDescription('The dynamically generative UI backend via AI')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Consider enabling CORS to allow the frontend to call this easily
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
