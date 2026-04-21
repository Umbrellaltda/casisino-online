import { BaseGame } from '../base-game';
import { GameRoundResult } from '../types';

/**
 * Configuração do jogo Roleta Europeia
 */
const ROULETTE_CONFIG = {
  name: 'European Roulette',
  type: 'roulette',
  minBet: 1.0,
  maxBet: 5000,
  rtp: 0.973, // Roleta europeia (single zero)
  numbers: 37, // 0-36
};

/**
 * Tipos de aposta na roleta
 */
export enum BetType {
  STRAIGHT = 'straight', // Número específico
  RED_BLACK = 'red_black', // Vermelho ou preto
  ODD_EVEN = 'odd_even', // Ímpar ou par
  LOW_HIGH = 'low_high', // 1-18 ou 19-36
  DOZEN = 'dozen', // 1ª, 2ª ou 3ª dúzia
  COLUMN = 'column', // Coluna
}

/**
 * Números vermelhos na roleta
 */
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

/**
 * Implementação do jogo Roleta Europeia
 */
export class RouletteGame extends BaseGame {
  constructor() {
    super(ROULETTE_CONFIG);
  }

  /**
   * Executa uma rodada de roleta
   * @param betAmount - Valor da aposta
   * @param userId - ID do usuário
   * @param betSelection - Seleção da aposta (número, cor, etc.)
   * @param betType - Tipo de aposta
   */
  async play(
    betAmount: number, 
    userId: string, 
    seed?: string,
    betSelection?: any,
    betType?: BetType,
  ): Promise<GameRoundResult> {
    this.validateBetAmount(betAmount);

    const roundId = this.generateRoundId();
    
    // Gira a roleta
    const winningNumber = this.spin(seed);
    
    // Determina resultado da aposta
    const betResult = this.evaluateBet(winningNumber, betSelection, betType);
    const winAmount = this.calculateWinnings(betAmount, betResult);

    return {
      roundId,
      gameId: this.id,
      userId,
      betAmount,
      winAmount,
      multiplier: winAmount / betAmount,
      result: {
        winningNumber,
        color: this.getNumberColor(winningNumber),
        isEven: winningNumber !== 0 && winningNumber % 2 === 0,
        isLow: winningNumber >= 1 && winningNumber <= 18,
        dozen: this.getDozen(winningNumber),
        column: this.getColumn(winningNumber),
        betType,
        betSelection,
        won: betResult,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Gira a roleta e retorna número vencedor
   */
  private spin(seed?: string): number {
    if (seed) {
      // Em produção: usar hash determinístico baseado na seed
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(seed).digest('hex');
      return parseInt(hash.substring(0, 8), 16) % ROULETTE_CONFIG.numbers;
    }
    return Math.floor(Math.random() * ROULETTE_CONFIG.numbers);
  }

  /**
   * Avalia se aposta foi vencedora
   */
  private evaluateBet(
    winningNumber: number, 
    selection: any, 
    type: BetType = BetType.STRAIGHT
  ): boolean {
    switch (type) {
      case BetType.STRAIGHT:
        return winningNumber === selection;
      
      case BetType.RED_BLACK:
        const isRed = RED_NUMBERS.includes(winningNumber);
        return selection === 'red' ? isRed : !isRed;
      
      case BetType.ODD_EVEN:
        if (winningNumber === 0) return false;
        const isEven = winningNumber % 2 === 0;
        return selection === 'even' ? isEven : !isEven;
      
      case BetType.LOW_HIGH:
        if (winningNumber === 0) return false;
        const isLow = winningNumber >= 1 && winningNumber <= 18;
        return selection === 'low' ? isLow : !isLow;
      
      case BetType.DOZEN:
        const dozen = this.getDozen(winningNumber);
        return dozen === selection;
      
      case BetType.COLUMN:
        const column = this.getColumn(winningNumber);
        return column === selection;
      
      default:
        return false;
    }
  }

  /**
   * Calcula winnings baseado no tipo de aposta
   */
  calculateWinnings(betAmount: number, won: boolean): number {
    if (!won) {
      return 0;
    }
    // Retorna aposta + lucro (multiplicadores padrão de cassino)
    return betAmount * 36; // Straight up paga 35:1
  }

  /**
   * Retorna cor do número
   */
  private getNumberColor(number: number): string {
    if (number === 0) return 'green';
    return RED_NUMBERS.includes(number) ? 'red' : 'black';
  }

  /**
   * Retorna dúzia do número (1, 2, 3 ou null para 0)
   */
  private getDozen(number: number): number | null {
    if (number === 0) return null;
    if (number <= 12) return 1;
    if (number <= 24) return 2;
    return 3;
  }

  /**
   * Retorna coluna do número (1, 2, 3 ou null para 0)
   */
  private getColumn(number: number): number | null {
    if (number === 0) return null;
    return ((number - 1) % 3) + 1;
  }

  /**
   * Retorna estatísticas dos últimos resultados (para frontend)
   */
  getHistory(): Record<string, any>[] {
    // Em produção: buscar do Redis/cache
    return [];
  }

  /**
   * Retorna payouts para cada tipo de aposta
   */
  getPayouts(): Record<string, number> {
    return {
      straight: 35,
      split: 17,
      street: 11,
      corner: 8,
      sixLine: 5,
      dozen: 2,
      column: 2,
      redBlack: 1,
      oddEven: 1,
      lowHigh: 1,
    };
  }
}
