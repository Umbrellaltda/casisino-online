import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { KycDocument } from './kyc-document.entity';
import { Wallet } from './wallet.entity';
import { Bet } from './bet.entity';
import { GameSession } from './game-session.entity';
import { UserRole } from './role.entity';
import { AuditLog } from './audit-log.entity';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum KycStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
@Index(['email'])
@Index(['username'])
@Index(['status'])
@Index(['kycStatus'])
@Index(['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_SUBMITTED,
  })
  kycStatus: KycStatus;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  twoFactorSecret?: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'inet', nullable: true })
  lastLoginIp?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  // Relations
  @OneToOne(() => KycDocument, (kyc) => kyc.user, { cascade: true })
  kycDocument?: KycDocument;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet?: Wallet;

  @OneToMany(() => Bet, (bet) => bet.user)
  bets: Bet[];

  @OneToMany(() => GameSession, (session) => session.user)
  gameSessions: GameSession[];

  @ManyToMany(() => UserRole, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: UserRole[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];
}
