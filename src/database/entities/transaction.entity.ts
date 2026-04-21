import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { User } from './user.entity';
import { TransactionEvent } from './transaction-event.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET = 'bet',
  WIN = 'win',
  BONUS = 'bonus',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('transactions')
@Index(['walletId'])
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
@Index(['idempotencyKey'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  walletId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string; // External payment gateway reference

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  idempotencyKey?: string; // For idempotent operations

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => TransactionEvent, (event) => event.transaction)
  events: TransactionEvent[];
}
