import { Module } from '@nestjs/common';
import { GamesModule } from './games.module';

/**
 * Módulo de Admin - Painel administrativo para gestão da plataforma
 */
@Module({
  imports: [GamesModule],
  providers: [],
  controllers: [],
})
export class AdminModule {}
