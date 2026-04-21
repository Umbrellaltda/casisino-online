import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Game } from './game.entity';

@Entity('game_sessions')
@Index(['userId'])
@Index(['sessionToken'])
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => User, (user) => user.gameSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, (game) => game.gameSessions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column({ type: 'varchar', length: 255, unique: true })
  sessionToken: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  startingBalance?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  endingBalance?: number;

  @Column({ type: 'integer', default: 0 })
  totalBets: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalWon: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalLost: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, completed, abandoned

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt?: Date;
}
