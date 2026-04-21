import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet, Transaction, Bet, AuditLog } from './audit/entities';

/**
 * Módulo de Wallet - Gerencia saldo, transações e auditoria
 * Implementa padrão CQRS para operações financeiras
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction, Bet, AuditLog]),
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class WalletModule {}
