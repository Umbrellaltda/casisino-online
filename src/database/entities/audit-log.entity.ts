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

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  BET_PLACED = 'bet_placed',
  BET_SETTLED = 'bet_settled',
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_COMPLETED = 'transaction_completed',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['entityType', 'entityId'])
@Index(['occurredAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', length: 50 })
  entityType: string; // user, wallet, transaction, bet, game

  @Column({ type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues?: Record<string, any>;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestId?: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;

  // Note: This entity is immutable - updates and deletes are prevented by database trigger
}
