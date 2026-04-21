import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PlaceBetDto, CashOutDto, GameHistoryDto } from '../dto/place-bet.dto';
import { GamesService } from '../games.service';

@Controller('api/games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('bet')
  @HttpCode(HttpStatus.OK)
  async placeBet(@Request() req, @Body() placeBetDto: PlaceBetDto) {
    const userId = req.user.userId;
    
    // Validate idempotency key format
    if (!placeBetDto.idempotencyKey || placeBetDto.idempotencyKey.length < 10) {
      throw new BadRequestException('Invalid idempotency key. Must be at least 10 characters.');
    }

    return this.gamesService.placeBet(userId, placeBetDto);
  }

  @Post('cashout')
  @HttpCode(HttpStatus.OK)
  async cashOut(@Request() req, @Body() cashOutDto: CashOutDto) {
    const userId = req.user.userId;
    return this.gamesService.cashOut(userId, cashOutDto);
  }

  @Get('sessions/:sessionId')
  async getSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    const userId = req.user.userId;
    return this.gamesService.getSession(userId, sessionId);
  }

  @Get('history')
  async getHistory(
    @Request() req,
    @Query() query: GameHistoryDto,
  ) {
    const userId = req.user.userId;
    return this.gamesService.getGameHistory(userId, query);
  }

  @Get('available')
  async getAvailableGames() {
    return this.gamesService.getAvailableGames();
  }

  @Get(':gameId/rules')
  async getGameRules(@Param('gameId') gameId: string) {
    return this.gamesService.getGameRules(gameId);
  }
}
