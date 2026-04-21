import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Bet } from './bet.entity';
import { GameSession } from './game-session.entity';

export enum GameType {
  SLOT = 'slot',
  BLACKJACK = 'blackjack',
  ROULETTE = 'roulette',
  POKER = 'poker',
  OTHER = 'other',
}

@Entity('games')
@Index(['type'])
@Index(['isActive'])
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: GameType,
  })
  type: GameType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0.01 })
  minBet: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 1000.0 })
  maxBet: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rtp?: number; // Return to Player percentage

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  configuration: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Bet, (bet) => bet.game)
  bets: Bet[];

  @OneToMany(() => GameSession, (session) => session.game)
  gameSessions: GameSession[];
}
