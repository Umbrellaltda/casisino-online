/**
 * Query: Obter saldo do usuário
 * Parte do padrão CQRS para transações financeiras
 */
export class GetBalanceQuery {
  constructor(public readonly userId: string) {}
}

/**
 * Query: Obter histórico de transações
 */
export class GetTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly type?: string,
  ) {}
}

/**
 * Query: Obter detalhes de transação específica
 */
export class GetTransactionQuery {
  constructor(public readonly transactionId: string) {}
}

/**
 * Query: Verificar se chave de idempotência já foi processada
 */
export class CheckIdempotencyQuery {
  constructor(
    public readonly idempotencyKey: string,
    public readonly userId: string,
  ) {}
}

/**
 * Query: Obter estatísticas de wallet
 */
export class GetWalletStatsQuery {
  constructor(
    public readonly userId: string,
    public readonly periodDays: number = 30,
  ) {}
}
