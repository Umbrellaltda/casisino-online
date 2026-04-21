import { Module } from '@nestjs/common';
import { SlotGame } from './slot/slot.game';
import { BlackjackGame } from './blackjack/blackjack.game';
import { RouletteGame } from './roulette/roulette.game';

/**
 * Módulo de Games - Gerencia todos os jogos da plataforma
 */
@Module({
  providers: [
    SlotGame,
    BlackjackGame,
    RouletteGame,
  ],
  exports: [
    SlotGame,
    BlackjackGame,
    RouletteGame,
  ],
})
export class GamesModule {}
