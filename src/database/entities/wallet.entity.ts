import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { Bet } from './bet.entity';

@Entity('wallets')
@Index(['userId'])
@Index(['currency'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  bonusBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  lockedBalance: number; // Balance locked in active bets

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalDeposited: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalWithdrawn: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalWon: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalLost: number;

  @VersionColumn()
  version: number; // For optimistic locking

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @OneToMany(() => Bet, (bet) => bet.wallet)
  bets: Bet[];

  // Check constraints are handled at database level
}
