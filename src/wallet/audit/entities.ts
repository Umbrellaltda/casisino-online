import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { TransactionStatus, TransactionType } from '@shared/types';

/**
 * Entidade: Registro de Auditoria de Transações
 * Logs imutáveis para todas as transações financeiras
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  balanceAfter: number;

  @Index()
  @Column({ unique: true })
  idempotencyKey: string;

  @Column('uuid', { nullable: true })
  gameId?: string;

  @Column('uuid', { nullable: true })
  relatedTransactionId?: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  correlationId: string;

  @Column('text')
  ipAddress: string;

  @Column('text', { nullable: true })
  userAgent: string;

  /**
   * Marca o log como imutável após criação
   */
  @Column({ default: false })
  isSealed: boolean;

  seal(): void {
    this.isSealed = true;
  }
}

/**
 * Entidade: Carteira do Usuário
 */
@Entity('wallets')
@Index(['userId'], { unique: true })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  lockedBalance: number; // Saldo reservado em apostas pendentes

  @Column('varchar', { length: 3, default: 'BRL' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  version: number; // Optimistic locking

  /**
   * Atualiza saldo com verificação de concorrência
   */
  debit(amount: number): void {
    if (this.balance < amount) {
      throw new Error('Saldo insuficiente');
    }
    this.balance -= amount;
    this.version++;
  }

  credit(amount: number): void {
    this.balance += amount;
    this.version++;
  }

  lock(amount: number): void {
    if (this.balance - this.lockedBalance < amount) {
      throw new Error('Saldo disponível insuficiente');
    }
    this.lockedBalance += amount;
  }

  unlock(amount: number): void {
    this.lockedBalance -= amount;
  }
}

/**
 * Entidade: Transação Financeira
 */
@Entity('transactions')
@Index(['userId', 'createdAt'])
@Index(['idempotencyKey'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  balanceBefore: number;

  @Column('decimal', { precision: 12, scale: 2 })
  balanceAfter: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column('uuid', { nullable: true })
  gameId?: string;

  @Column('uuid', { nullable: true })
  betId?: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column('uuid')
  correlationId: string;
}

/**
 * Entidade: Aposta
 */
@Entity('bets')
@Index(['userId', 'gameId', 'createdAt'])
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  gameId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  winAmount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column('jsonb', { nullable: true })
  gameResult: Record<string, any>;

  @Column({ unique: true })
  idempotencyKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledAt?: Date;

  @Column('uuid')
  transactionId: string;
}
