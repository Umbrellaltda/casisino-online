import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet, Transaction, User } from '../database/entities';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getBalance(userId: string, currency: string = 'BRL'): Promise<{ balance: number; currency: string }> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, currency },
    });

    if (!wallet) {
      // Create default wallet if not exists
      const newWallet = this.walletRepository.create({
        userId,
        currency,
        balance: 0,
      });
      await this.walletRepository.save(newWallet);
      return { balance: 0, currency };
    }

    return { balance: wallet.balance, currency };
  }

  async deposit(userId: string, dto: DepositDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get or create wallet
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId, currency: 'BRL' },
      });

      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, {
          userId,
          currency: 'BRL',
          balance: 0,
        });
        await queryRunner.manager.save(wallet);
      }

      // Create transaction
      const transaction = queryRunner.manager.create(Transaction, {
        wallet,
        type: 'deposit',
        amount: dto.amount,
        status: 'completed',
        paymentMethod: dto.paymentMethod,
        reference: dto.transactionRef || `DEP-${Date.now()}`,
      });

      await queryRunner.manager.save(transaction);

      // Update wallet balance
      wallet.balance += dto.amount;
      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      this.logger.log(`Deposit completed: userId=${userId}, amount=${dto.amount}`);

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Deposit failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(userId: string, dto: WithdrawDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId, currency: 'BRL' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Create transaction
      const transaction = queryRunner.manager.create(Transaction, {
        wallet,
        type: 'withdrawal',
        amount: -dto.amount,
        status: 'pending',
        withdrawalMethod: dto.withdrawalMethod,
        accountDetails: dto.accountDetails,
        idempotencyKey: dto.idempotencyKey,
      });

      await queryRunner.manager.save(transaction);

      // Deduct balance immediately (hold funds)
      wallet.balance -= dto.amount;
      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      this.logger.log(`Withdrawal requested: userId=${userId}, amount=${dto.amount}`);

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Withdrawal failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(fromUserId: string, dto: TransferDto): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check idempotency
      const existingTx = await queryRunner.manager.findOne(Transaction, {
        where: { idempotencyKey: dto.idempotencyKey },
      });

      if (existingTx) {
        this.logger.log(`Duplicate transfer prevented: ${dto.idempotencyKey}`);
        throw new BadRequestException('Transfer already processed');
      }

      const fromWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: fromUserId, currency: 'BRL' },
      });

      if (!fromWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      if (fromWallet.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Get or create recipient wallet
      let toWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: dto.toUserId, currency: 'BRL' },
      });

      if (!toWallet) {
        toWallet = queryRunner.manager.create(Wallet, {
          userId: dto.toUserId,
          currency: 'BRL',
          balance: 0,
        });
        await queryRunner.manager.save(toWallet);
      }

      // Create transactions
      const fromTransaction = queryRunner.manager.create(Transaction, {
        wallet: fromWallet,
        type: 'transfer_out',
        amount: -dto.amount,
        status: 'completed',
        relatedUserId: dto.toUserId,
        description: dto.reason || 'Transfer',
        idempotencyKey: dto.idempotencyKey,
      });

      const toTransaction = queryRunner.manager.create(Transaction, {
        wallet: toWallet,
        type: 'transfer_in',
        amount: dto.amount,
        status: 'completed',
        relatedUserId: fromUserId,
        description: dto.reason || 'Transfer received',
        idempotencyKey: `${dto.idempotencyKey}-recv`,
      });

      await queryRunner.manager.save([fromTransaction, toTransaction]);

      // Update balances
      fromWallet.balance -= dto.amount;
      toWallet.balance += dto.amount;
      await queryRunner.manager.save([fromWallet, toWallet]);

      await queryRunner.commitTransaction();

      this.logger.log(`Transfer completed: from=${fromUserId}, to=${dto.toUserId}, amount=${dto.amount}`);

      return { fromTransaction, toTransaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transfer failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(
    userId: string,
    options: { type?: string; limit?: number; offset?: number } = {},
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        wallet: { userId },
        ...(options.type ? { type: options.type } : {}),
      },
      order: { createdAt: 'DESC' },
      take: options.limit || 20,
      skip: options.offset || 0,
    });

    return { transactions, total };
  }

  async getTransactionById(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, wallet: { userId } },
      relations: ['wallet'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getAllWallets(page: number = 1, limit: number = 20): Promise<{ wallets: Wallet[]; total: number }> {
    const [wallets, total] = await this.walletRepository.findAndCount({
      relations: ['user'],
      order: { balance: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { wallets, total };
  }

  async adminAdjustBalance(userId: string, amount: number, reason: string): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId, currency: 'BRL' },
      });

      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, {
          userId,
          currency: 'BRL',
          balance: 0,
        });
        await queryRunner.manager.save(wallet);
      }

      const transaction = queryRunner.manager.create(Transaction, {
        wallet,
        type: 'adjustment',
        amount,
        status: 'completed',
        description: `Admin adjustment: ${reason}`,
      });

      await queryRunner.manager.save(transaction);

      wallet.balance += amount;
      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      this.logger.log(`Admin balance adjustment: userId=${userId}, amount=${amount}, reason=${reason}`);

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Admin adjustment failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
