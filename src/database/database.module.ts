import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

// Entities
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { KycDocument } from '../entities/kyc-document.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionEvent } from '../entities/transaction-event.entity';
import { Game } from '../entities/game.entity';
import { Bet } from '../entities/bet.entity';
import { GameSession } from '../entities/game-session.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { SystemSetting } from '../entities/system-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'casino_platform'),
        entities: [
          User,
          Role,
          KycDocument,
          Wallet,
          Transaction,
          TransactionEvent,
          Game,
          Bet,
          GameSession,
          AuditLog,
          SystemSetting,
        ],
        migrations: ['src/database/migrations/*.ts'],
        subscribers: ['src/database/subscribers/*.ts'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        logger: 'file',
        extra: {
          max: 20, // Maximum number of connections in pool
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),
    
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'client',
        url: `redis://${configService.get<string>('REDIS_HOST', 'localhost')}:${configService.get<number>('REDIS_PORT', 6379)}`,
        password: configService.get<string>('REDIS_PASSWORD') || undefined,
        options: {
          retryStrategy: (times: number) => {
            if (times > 10) {
              return null; // Stop retrying
            }
            return Math.min(times * 50, 2000); // Retry with exponential backoff
          },
        },
      }),
      inject: [ConfigService],
    }),
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),
  ],
})
export class DatabaseModule {}
