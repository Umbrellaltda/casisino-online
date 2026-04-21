/**
 * Tipos compartilhados para toda a plataforma
 */

// Identificadores únicos
export type UUID = string;

// Status de transações financeiras
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

// Tipos de transação
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET = 'bet',
  WIN = 'win',
  BONUS = 'bonus',
  REFUND = 'refund',
}

// Status do usuário
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_KYC = 'pending_kyc',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
}

// Provedores de jogo
export enum GameProvider {
  INTERNAL = 'internal',
  THIRD_PARTY = 'third_party',
}

// Status do jogo
export enum GameStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  DISABLED = 'disabled',
}

// Resultado de aposta
export interface BetResult {
  betId: UUID;
  gameId: UUID;
  userId: UUID;
  amount: number;
  winAmount: number;
  status: TransactionStatus;
  timestamp: Date;
  idempotencyKey: string;
}

// Evento de aposta (para Message Queue)
export interface BetEvent {
  eventId: UUID;
  eventType: 'BET_PLACED' | 'BET_SETTLED' | 'BET_CANCELLED';
  payload: BetResult;
  timestamp: Date;
  correlationId: UUID;
}

// Dados de sessão do usuário
export interface UserSession {
  userId: UUID;
  sessionId: UUID;
  balance: number;
  activeGameId?: UUID;
  lastActivity: Date;
  expiresAt: Date;
}

// Paginação
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Erros padronizados
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export enum ErrorCodes {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_BET_AMOUNT = 'INVALID_BET_AMOUNT',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
  KYC_REQUIRED = 'KYC_REQUIRED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
