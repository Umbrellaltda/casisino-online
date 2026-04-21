/**
 * Constantes globais da plataforma
 */

// Limites de aposta
export const BET_LIMITS = {
  MIN_BET_AMOUNT: 0.10,
  MAX_BET_AMOUNT: 10000.00,
  MAX_WIN_MULTIPLIER: 5000,
} as const;

// Configurações de sessão
export const SESSION_CONFIG = {
  EXPIRY_HOURS: 24,
  EXTEND_ON_ACTIVITY: true,
  MAX_CONCURRENT_SESSIONS: 3,
} as const;

// Configurações de idempotência
export const IDEMPOTENCY_CONFIG = {
  KEY_TTL_HOURS: 24,
  WINDOW_SECONDS: 60,
} as const;

// Configurações de auditoria
export const AUDIT_CONFIG = {
  RETENTION_DAYS: 2555, // 7 anos
  IMMUTABLE: true,
  ENCRYPTION_REQUIRED: true,
} as const;

// Configurações do Redis
export const REDIS_CONFIG = {
  SESSION_PREFIX: 'session:',
  IDEMPOTENCY_PREFIX: 'idempotency:',
  CACHE_PREFIX: 'cache:',
  RATE_LIMIT_PREFIX: 'ratelimit:',
} as const;

// Configurações de fila
export const QUEUE_CONFIG = {
  BET_EVENTS: 'bet-events',
  TRANSACTION_EVENTS: 'transaction-events',
  AUDIT_EVENTS: 'audit-events',
  NOTIFICATION_EVENTS: 'notification-events',
} as const;

// Moedas suportadas
export const CURRENCIES = {
  BRL: { code: 'BRL', symbol: 'R$', decimals: 2 },
  USD: { code: 'USD', symbol: '$', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', decimals: 2 },
} as const;

// Níveis KYC
export const KYC_LEVELS = {
  NONE: 0,
  BASIC: 1,
  VERIFIED: 2,
  PREMIUM: 3,
} as const;

// Limites por nível KYC
export const KYC_LIMITS = {
  [KYC_LEVELS.NONE]: { dailyDeposit: 0, dailyWithdrawal: 0, maxBet: 0 },
  [KYC_LEVELS.BASIC]: { dailyDeposit: 1000, dailyWithdrawal: 500, maxBet: 100 },
  [KYC_LEVELS.VERIFIED]: { dailyDeposit: 10000, dailyWithdrawal: 5000, maxBet: 1000 },
  [KYC_LEVELS.PREMIUM]: { dailyDeposit: 100000, dailyWithdrawal: 50000, maxBet: 10000 },
} as const;

// Tipos de jogo disponíveis
export const GAME_TYPES = {
  SLOT: 'slot',
  BLACKJACK: 'blackjack',
  ROULETTE: 'roulette',
  POKER: 'poker',
  DICE: 'dice',
} as const;

// RTP (Return to Player) mínimo por regulamentação
export const RTP_CONFIG = {
  MINIMUM: 0.85, // 85% mínimo
  TARGET: 0.96, // 96% alvo
  AUDIT_FREQUENCY_HOURS: 1,
} as const;
