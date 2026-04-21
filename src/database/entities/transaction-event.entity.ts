import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('transaction_events')
@Index(['transactionId'])
@Index(['occurredAt'])
export class TransactionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'varchar', length: 50 })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;
}
