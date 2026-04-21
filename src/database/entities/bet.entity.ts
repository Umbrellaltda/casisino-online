import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { Game } from './game.entity';

export enum BetStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
  VOID = 'void',
}

@Entity('bets')
@Index(['userId'])
@Index(['walletId'])
@Index(['gameId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['idempotencyKey'])
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  walletId: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => User, (user) => user.bets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.bets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @ManyToOne(() => Game, (game) => game.bets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  potentialWin?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  actualWin: number;

  @Column({
    type: 'enum',
    enum: BetStatus,
    default: BetStatus.PENDING,
  })
  status: BetStatus;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  idempotencyKey?: string; // Prevent duplicate bets

  @Column({ type: 'varchar', length: 255, nullable: true })
  roundId?: string; // Game round identifier

  @Column({ type: 'jsonb' })
  betData: Record<string, any>; // Game-specific bet details

  @Column({ type: 'jsonb', nullable: true })
  resultData?: Record<string, any>; // Game result

  @Column({ type: 'timestamptz', nullable: true })
  settledAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
