import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Bet, GameSession, Game, User } from '../database/entities';
import { PlaceBetDto, CashOutDto, GameHistoryDto } from './dto/place-bet.dto';
import { SlotGame } from './slot/slot.game';
import { BlackjackGame } from './blackjack/blackjack.game';
import { RouletteGame } from './roulette/roulette.game';
import { GameResult, GameState } from './types';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private readonly gameEngines: Map<string, any>;

  constructor(
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly dataSource: DataSource,
  ) {
    // Initialize game engines
    this.gameEngines = new Map([
      ['slots', new SlotGame()],
      ['blackjack', new BlackjackGame()],
      ['roulette', new RouletteGame()],
    ]);
  }

  async placeBet(userId: string, dto: PlaceBetDto): Promise<{ session: GameSession; bet: Bet }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for idempotency - prevent duplicate bets
      const existingBet = await queryRunner.manager.findOne(Bet, {
        where: { idempotencyKey: dto.idempotencyKey },
      });

      if (existingBet) {
        this.logger.log(`Duplicate bet prevented: ${dto.idempotencyKey}`);
        return { session: existingBet.session, bet: existingBet };
      }

      // Get or create game session
      let session = await queryRunner.manager.findOne(GameSession, {
        where: { userId, status: 'active' },
        relations: ['game'],
      });

      if (!session || session.game.id !== dto.gameId) {
        // Create new session
        const game = await queryRunner.manager.findOne(Game, {
          where: { id: dto.gameId, active: true },
        });

        if (!game) {
          throw new NotFoundException(`Game ${dto.gameId} not found or inactive`);
        }

        session = queryRunner.manager.create(GameSession, {
          user: { id: userId } as User,
          game,
          status: 'active',
          balance: 0,
        });
        await queryRunner.manager.save(session);
      }

      // Get game engine and validate bet
      const engine = this.gameEngines.get(dto.gameId);
      if (!engine) {
        throw new NotFoundException(`Game engine ${dto.gameId} not found`);
      }

      const isValid = engine.validateBet(dto.betType, dto.betData);
      if (!isValid) {
        throw new BadRequestException('Invalid bet type or data for this game');
      }

      // Create bet
      const bet = queryRunner.manager.create(Bet, {
        session,
        user: { id: userId } as User,
        amount: dto.amount,
        betType: dto.betType,
        betData: dto.betData,
        status: 'pending',
        idempotencyKey: dto.idempotencyKey,
      });

      await queryRunner.manager.save(bet);

      // Process game result
      const result = engine.play(dto.betType, dto.betData);
      
      bet.result = JSON.stringify(result);
      bet.status = result.win ? 'won' : 'lost';
      bet.payout = result.win ? result.payout : 0;

      await queryRunner.manager.save(bet);

      // Update session balance
      session.balance += result.win ? result.payout : -dto.amount;
      if (session.balance <= 0) {
        session.status = 'finished';
      }
      await queryRunner.manager.save(session);

      await queryRunner.commitTransaction();

      this.logger.log(`Bet placed: userId=${userId}, gameId=${dto.gameId}, amount=${dto.amount}`);

      return { session, bet };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to place bet: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cashOut(userId: string, dto: CashOutDto): Promise<GameSession> {
    const session = await this.gameSessionRepository.findOne({
      where: { id: dto.sessionId, userId, status: 'active' },
      relations: ['game', 'bets'],
    });

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    session.status = 'finished';
    session.cashedOutAt = new Date();
    await this.gameSessionRepository.save(session);

    this.logger.log(`Cash out: sessionId=${dto.sessionId}, finalBalance=${session.balance}`);

    return session;
  }

  async getSession(userId: string, sessionId: string): Promise<GameSession> {
    const session = await this.gameSessionRepository.findOne({
      where: { id: sessionId, userId },
      relations: ['game', 'bets'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async getGameHistory(userId: string, query: GameHistoryDto): Promise<{ bets: Bet[]; total: number }> {
    const [bets, total] = await this.betRepository.findAndCount({
      where: { 
        userId,
        ...(query.gameId ? { session: { game: { id: query.gameId } } } : {}),
      },
      relations: ['session.game'],
      order: { createdAt: 'DESC' },
      take: query.limit || 20,
      skip: query.offset || 0,
    });

    return { bets, total };
  }

  async getAvailableGames(): Promise<Game[]> {
    return this.gameRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
  }

  async getGameRules(gameId: string): Promise<any> {
    const engine = this.gameEngines.get(gameId);
    if (!engine) {
      throw new NotFoundException(`Game ${gameId} not found`);
    }

    return engine.getRules();
  }
}
