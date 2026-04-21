/**
 * Command: Debitar valor da carteira do usuário
 * Parte do padrão CQRS para transações financeiras
 */
export class DebitWalletCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly transactionType: string,
    public readonly idempotencyKey: string,
    public readonly gameId?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}

/**
 * Command: Creditar valor na carteira do usuário
 */
export class CreditWalletCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly transactionType: string,
    public readonly idempotencyKey: string,
    public readonly gameId?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}

/**
 * Command: Realizar aposta (debita e potencialmente credita)
 */
export class PlaceBetCommand {
  constructor(
    public readonly userId: string,
    public readonly gameId: string,
    public readonly betAmount: number,
    public readonly idempotencyKey: string,
    public readonly gameData?: Record<string, any>,
  ) {}
}

/**
 * Command: Processar resultado de aposta
 */
export class SettleBetCommand {
  constructor(
    public readonly betId: string,
    public readonly userId: string,
    public readonly winAmount: number,
    public readonly gameResult: Record<string, any>,
  ) {}
}

/**
 * Command: Solicitar saque
 */
export class WithdrawCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly pixKey: string,
    public readonly idempotencyKey: string,
  ) {}
}

/**
 * Command: Solicitar depósito
 */
export class DepositCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly paymentMethod: string,
  ) {}
}
