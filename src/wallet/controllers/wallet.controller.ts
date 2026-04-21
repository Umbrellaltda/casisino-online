import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { DepositDto, WithdrawDto, TransferDto } from '../dto/wallet.dto';
import { WalletService } from '../wallet.service';

@Controller('api/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req, @Query('currency') currency?: string) {
    const userId = req.user.userId;
    return this.walletService.getBalance(userId, currency);
  }

  @Post('deposit')
  @HttpCode(HttpStatus.CREATED)
  async deposit(@Request() req, @Body() depositDto: DepositDto) {
    const userId = req.user.userId;
    return this.walletService.deposit(userId, depositDto);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(@Request() req, @Body() withdrawDto: WithdrawDto) {
    const userId = req.user.userId;
    return this.walletService.withdraw(userId, withdrawDto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(@Request() req, @Body() transferDto: TransferDto) {
    const fromUserId = req.user.userId;
    return this.walletService.transfer(fromUserId, transferDto);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user.userId;
    return this.walletService.getTransactionHistory(userId, { type, limit, offset });
  }

  @Get('transactions/:id')
  async getTransaction(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.walletService.getTransactionById(userId, id);
  }

  // Admin endpoints
  @Get('all')
  @UseGuards(AdminGuard)
  async getAllWallets(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.walletService.getAllWallets(page, limit);
  }

  @Post('adjust')
  @UseGuards(AdminGuard)
  async adjustBalance(
    @Body() body: { userId: string; amount: number; reason: string },
  ) {
    return this.walletService.adminAdjustBalance(body.userId, body.amount, body.reason);
  }
}
