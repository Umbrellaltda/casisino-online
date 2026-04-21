import { BaseGame } from '../base-game';
import { GameRoundResult } from '../types';
import { generateUUID, calculateWinnings } from '@shared/utils/helpers';

/**
 * Configuração do jogo Slot
 */
const SLOT_CONFIG = {
  name: 'Slot Machine',
  type: 'slot',
  minBet: 0.50,
  maxBet: 500,
  rtp: 0.96,
  reels: 5,
  rows: 3,
  symbols: ['🍒', '🍋', '🍇', '🍉', '🔔', '💎', '7️⃣'],
  paylines: 20,
};

/**
 * Implementação do jogo Slot Machine
 */
export class SlotGame extends BaseGame {
  private readonly reels: number;
  private readonly rows: number;
  private readonly symbols: string[];
  private readonly paylines: number;

  constructor() {
    super(SLOT_CONFIG);
    this.reels = SLOT_CONFIG.reels;
    this.rows = SLOT_CONFIG.rows;
    this.symbols = SLOT_CONFIG.symbols;
    this.paylines = SLOT_CONFIG.paylines;
  }

  /**
   * Executa uma rodada do slot
   * @param betAmount - Valor da aposta
   * @param userId - ID do usuário
   * @param seed - Seed opcional para RNG (auditoria)
   */
  async play(betAmount: number, userId: string, seed?: string): Promise<GameRoundResult> {
    this.validateBetAmount(betAmount);

    const roundId = this.generateRoundId();
    
    // Gira os rolos (RNG)
    const result = this.spinReels(seed);
    
    // Calcula winnings baseado nas linhas vencedoras
    const winAmount = this.calculateWinnings(betAmount, result);

    return {
      roundId,
      gameId: this.id,
      userId,
      betAmount,
      winAmount,
      multiplier: winAmount / betAmount,
      result: {
        grid: result.grid,
        winningLines: result.winningLines,
        totalWin: winAmount,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Gira os rolos e retorna o resultado
   */
  private spinReels(seed?: string): { grid: string[][]; winningLines: number[] } {
    const grid: string[][] = [];
    
    // Preenche grid com símbolos aleatórios
    for (let row = 0; row < this.rows; row++) {
      const reelRow: string[] = [];
      for (let reel = 0; reel < this.reels; reel++) {
        const randomIndex = this.randomIndex(seed, reel, row);
        reelRow.push(this.symbols[randomIndex]);
      }
      grid.push(reelRow);
    }

    // Verifica linhas vencedoras (simplificado)
    const winningLines = this.checkWinningLines(grid);

    return { grid, winningLines };
  }

  /**
   * Gera índice aleatório para símbolo (com seed para auditoria)
   */
  private randomIndex(seed?: string, reel?: number, row?: number): number {
    if (seed) {
      // Em produção: usar hash determinístico baseado na seed
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(`${seed}:${reel}:${row}`).digest('hex');
      return parseInt(hash.substring(0, 8), 16) % this.symbols.length;
    }
    return Math.floor(Math.random() * this.symbols.length);
  }

  /**
   * Verifica linhas vencedoras no grid
   * Implementação simplificada - em produção seria mais complexo
   */
  private checkWinningLines(grid: string[][]): number[] {
    const winningLines: number[] = [];
    
    // Verifica cada linha horizontal
    for (let row = 0; row < this.rows; row++) {
      const firstSymbol = grid[row][0];
      let matchCount = 1;
      
      for (let reel = 1; reel < this.reels; reel++) {
        if (grid[row][reel] === firstSymbol) {
          matchCount++;
        } else {
          break;
        }
      }
      
      // 3 ou mais símbolos iguais = vitória
      if (matchCount >= 3) {
        winningLines.push(row);
      }
    }

    return winningLines;
  }

  /**
   * Calcula winnings baseado no resultado
   */
  calculateWinnings(betAmount: number, result: { grid: string[][]; winningLines: number[] }): number {
    if (result.winningLines.length === 0) {
      return 0;
    }

    // Multiplicador baseado no número de linhas vencedoras e símbolos
    const baseMultiplier = result.winningLines.length * 2;
    const symbolBonus = this.getSymbolBonus(result.grid);
    
    const totalMultiplier = baseMultiplier + symbolBonus;
    
    return calculateWinnings(betAmount, totalMultiplier);
  }

  /**
   * Bônus baseado em símbolos especiais
   */
  private getSymbolBonus(grid: string[][]): number {
    let bonus = 0;
    
    // Conta símbolos premium (💎 e 7️⃣)
    for (const row of grid) {
      for (const symbol of row) {
        if (symbol === '💎') bonus += 0.5;
        if (symbol === '7️⃣') bonus += 1;
      }
    }

    return bonus;
  }

  /**
   * Retorna configurações detalhadas do slot
   */
  getDetailedConfig(): Record<string, any> {
    return {
      ...this.getStats(),
      reels: this.reels,
      rows: this.rows,
      symbols: this.symbols,
      paylines: this.paylines,
    };
  }
}
