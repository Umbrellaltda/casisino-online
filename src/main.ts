import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

/**
 * Bootstrapping da aplicação
 */
async function bootstrap() {
  // Configuração de logs com Winston
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}] ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Habilita CORS para frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Pipe global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefixo global para API
  app.setGlobalPrefix('api');

  // Porta do servidor
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  console.log(`🎰 Casino Platform rodando em http://localhost:${port}`);
}

bootstrap().catch(err => {
  console.error('Erro ao iniciar aplicação:', err);
  process.exit(1);
});
