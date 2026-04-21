/**
 * Interface base para todos os jogos
 */
export interface IGame {
  id: string;
  name: string;
  type: string;
  minBet: number;
  maxBet: number;
  rtp: number; // Return to Player
  status: 'active' | 'maintenance' | 'disabled';
}

/**
 * Resultado de uma rodada de jogo
 */
export interface GameRoundResult {
  roundId: string;
  gameId: string;
  userId: string;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  result: Record<string, any>;
  timestamp: Date;
}

/**
 * Estado da sessão do jogo
 */
export interface GameSession {
  sessionId: string;
  userId: string;
  gameId: string;
  balance: number;
  lastBetId?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Configuração de jogo
 */
export interface GameConfig {
  id: string;
  name: string;
  type: string;
  minBet: number;
  maxBet: number;
  maxWin: number;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  features: string[];
  rules: string;
}
