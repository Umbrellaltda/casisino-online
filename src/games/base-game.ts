import { IGame, GameRoundResult } from '../types';
import { generateUUID } from '@shared/utils/helpers';

/**
 * Classe abstrata base para todos os jogos
 * Implementa lógica comum e define contrato para jogos específicos
 */
export abstract class BaseGame implements IGame {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly minBet: number;
  public readonly maxBet: number;
  public readonly rtp: number;
  public status: 'active' | 'maintenance' | 'disabled';

  protected constructor(config: Partial<IGame>) {
    this.id = config.id || generateUUID();
    this.name = config.name || 'Unknown Game';
    this.type = config.type || 'unknown';
    this.minBet = config.minBet || 0.1;
    this.maxBet = config.maxBet || 10000;
    this.rtp = config.rtp || 0.96;
    this.status = config.status || 'active';
  }

  /**
   * Valida valor da aposta
   */
  protected validateBetAmount(amount: number): void {
    if (amount < this.minBet) {
      throw new Error(`Aposta mínima: ${this.minBet}`);
    }
    if (amount > this.maxBet) {
      throw new Error(`Aposta máxima: ${this.maxBet}`);
    }
  }

  /**
   * Gera ID único para rodada
   */
  protected generateRoundId(): string {
    return generateUUID();
  }

  /**
   * Método abstrato para executar rodada do jogo
   * Deve ser implementado por cada jogo específico
   */
  abstract play(betAmount: number, userId: string, seed?: string): Promise<GameRoundResult>;

  /**
   * Método abstrato para calcular winnings
   */
  abstract calculateWinnings(betAmount: number, result: any): number;

  /**
   * Verifica se jogo está disponível para jogar
   */
  isAvailable(): boolean {
    return this.status === 'active';
  }

  /**
   * Retorna estatísticas do jogo (para auditoria RTP)
   */
  getStats(): Record<string, any> {
    return {
      gameId: this.id,
      name: this.name,
      type: this.type,
      rtp: this.rtp,
      status: this.status,
      betLimits: {
        min: this.minBet,
        max: this.maxBet,
      },
    };
  }
}

/**
 * Factory para criação de instâncias de jogos
 */
export class GameFactory {
  private static games: Map<string, new () => BaseGame> = new Map();

  static register(gameType: string, gameClass: new () => BaseGame): void {
    this.games.set(gameType, gameClass);
  }

  static create(gameType: string): BaseGame | null {
    const gameClass = this.games.get(gameType);
    if (!gameClass) {
      return null;
    }
    return new gameClass();
  }

  static getAvailableGames(): string[] {
    return Array.from(this.games.keys());
  }
}
