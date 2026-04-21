import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Transaction, Bet, Game, AuditLog } from '../database/entities';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, totalTransactions, totalBets, totalRevenue] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: 'active' } }),
      this.transactionRepository.count(),
      this.betRepository.count(),
      this.transactionRepository
        .createQueryBuilder('t')
        .where('t.type = :type', { type: 'deposit' })
        .andWhere('t.type != :withdrawalType', { withdrawalType: 'withdrawal' })
        .getSum('t.amount'),
    ]);

    const recentActivities = await this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      users: { total, active: activeUsers },
      transactions: { total: totalTransactions },
      bets: { total: totalBets },
      revenue: { total: totalRevenue || 0 },
      recentActivities,
    };
  }

  async getUsers(page: number = 1, limit: number = 20, status?: string) {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .orderBy('user.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    const [users, total] = await query.getManyAndCount();

    return { users, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'kycDocuments', 'wallets'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(id: string, status: string, reason?: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status as any;
    await this.userRepository.save(user);

    // Log audit
    await this.auditLogRepository.save({
      entityType: 'user',
      entityId: id,
      action: 'status_change',
      changes: { oldStatus: user.status, newStatus: status, reason },
      performedBy: 'admin',
    });

    this.logger.log(`User ${id} status updated to ${status}`);

    return { success: true, user: { id, status } };
  }

  async getAllTransactions(type?: string, status?: string, limit: number = 50) {
    const query = this.transactionRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.wallet', 'wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .orderBy('t.createdAt', 'DESC')
      .take(limit);

    if (type) {
      query.andWhere('t.type = :type', { type });
    }

    if (status) {
      query.andWhere('t.status = :status', { status });
    }

    return query.getMany();
  }

  async getAllBets(gameId?: string, status?: string, limit: number = 50) {
    const query = this.betRepository.createQueryBuilder('bet')
      .leftJoinAndSelect('bet.session', 'session')
      .leftJoinAndSelect('session.game', 'game')
      .leftJoinAndSelect('bet.user', 'user')
      .orderBy('bet.createdAt', 'DESC')
      .take(limit);

    if (gameId) {
      query.andWhere('game.id = :gameId', { gameId });
    }

    if (status) {
      query.andWhere('bet.status = :status', { status });
    }

    return query.getMany();
  }

  async getAllGames() {
    return this.gameRepository.find({ order: { name: 'ASC' } });
  }

  async toggleGameActive(id: string) {
    const game = await this.gameRepository.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    game.active = !game.active;
    await this.gameRepository.save(game);

    // Log audit
    await this.auditLogRepository.save({
      entityType: 'game',
      entityId: id,
      action: 'toggle_active',
      changes: { active: game.active },
      performedBy: 'admin',
    });

    this.logger.log(`Game ${id} active status toggled to ${game.active}`);

    return { success: true, game: { id, name: game.name, active: game.active } };
  }

  async getAuditLogs(entityType?: string, entityId?: string, limit: number = 50) {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC')
      .take(limit);

    if (entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    return query.getMany();
  }

  async generateDailyReport(date?: string) {
    const reportDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    const [newUsers, totalBets, totalDeposits, totalWithdrawals] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.betRepository
        .createQueryBuilder('bet')
        .innerJoin('bet.session', 'session')
        .where('session.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
        .getMany(),
      this.transactionRepository
        .createQueryBuilder('t')
        .where('t.type = :type', { type: 'deposit' })
        .andWhere('t.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
        .getSum('t.amount'),
      this.transactionRepository
        .createQueryBuilder('t')
        .where('t.type = :withdrawal', { type: 'withdrawal' })
        .andWhere('t.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
        .getSum('t.amount'),
    ]);

    const totalBetAmount = totalBets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalPayout = totalBets.filter((b) => b.status === 'won').reduce((sum, bet) => sum + (bet.payout || 0), 0);

    return {
      date: reportDate.toISOString().split('T')[0],
      metrics: {
        newUsers,
        totalBets: totalBets.length,
        totalBetAmount,
        totalPayout,
        grossGamingRevenue: totalBetAmount - totalPayout,
        deposits: totalDeposits || 0,
        withdrawals: totalWithdrawals || 0,
        netRevenue: (totalDeposits || 0) - (totalWithdrawals || 0) + (totalBetAmount - totalPayout),
      },
    };
  }

  async generateRevenueReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const dailyData = [];
    const current = new Date(start);

    while (current <= end) {
      const report = await this.generateDailyReport(current.toISOString());
      dailyData.push(report);
      current.setDate(current.getDate() + 1);
    }

    const totals = dailyData.reduce(
      (acc, day) => ({
        newUsers: acc.newUsers + day.metrics.newUsers,
        totalBets: acc.totalBets + day.metrics.totalBets,
        totalBetAmount: acc.totalBetAmount + day.metrics.totalBetAmount,
        totalPayout: acc.totalPayout + day.metrics.totalPayout,
        grossGamingRevenue: acc.grossGamingRevenue + day.metrics.grossGamingRevenue,
        deposits: acc.deposits + day.metrics.deposits,
        withdrawals: acc.withdrawals + day.metrics.withdrawals,
        netRevenue: acc.netRevenue + day.metrics.netRevenue,
      }),
      { newUsers: 0, totalBets: 0, totalBetAmount: 0, totalPayout: 0, grossGamingRevenue: 0, deposits: 0, withdrawals: 0, netRevenue: 0 },
    );

    return {
      period: { startDate, endDate },
      dailyData,
      totals,
    };
  }
}
