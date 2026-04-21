import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { AppError, ErrorCodes } from '@shared/types';

/**
 * Gera um novo UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Valida se uma string é um UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  return uuidValidate(uuid);
}

/**
 * Sanitiza valor monetário (evita problemas de precisão floating point)
 */
export function sanitizeMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Converte valor para centavos (inteiro) para armazenamento seguro
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converte centavos para valor decimal
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Gera chave de idempotência única baseada em userId + gameId + timestamp
 */
export function generateIdempotencyKey(
  userId: string,
  gameId: string,
  timestamp: number,
): string {
  return `${userId}:${gameId}:${timestamp}`;
}

/**
 * Hash simples para chaves de idempotência (usando em produção com Redis)
 */
export function hashIdempotencyKey(key: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Delay assíncrono para retries
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100,
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries - 1) break;
      await delay(baseDelay * Math.pow(2, i));
    }
  }
  
  throw lastError!;
}

/**
 * Valida limites de aposta
 */
export function validateBetAmount(
  amount: number,
  minBet: number,
  maxBet: number,
): void {
  const sanitizedAmount = sanitizeMoney(amount);
  
  if (sanitizedAmount < minBet || sanitizedAmount > maxBet) {
    throw new AppError(
      ErrorCodes.INVALID_BET_AMOUNT,
      400,
      `Aposta deve estar entre ${minBet} e ${maxBet}`,
    );
  }
}

/**
 * Calcula winnings baseado no multiplicador
 */
export function calculateWinnings(betAmount: number, multiplier: number): number {
  return sanitizeMoney(betAmount * multiplier);
}

/**
 * Formata valor para exibição
 */
export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
