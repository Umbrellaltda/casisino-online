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
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminService } from '../services/admin.service';

@Controller('api/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers(page, limit, status);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  async activateUser(@Param('id') id: string) {
    return this.adminService.updateUserStatus(id, 'active');
  }

  @Post('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendUser(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.updateUserStatus(id, 'suspended', body.reason);
  }

  @Get('transactions')
  async getTransactions(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllTransactions(type, status, limit);
  }

  @Get('bets')
  async getBets(
    @Query('gameId') gameId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllBets(gameId, status, limit);
  }

  @Get('games')
  async getGames() {
    return this.adminService.getAllGames();
  }

  @Post('games/:id/toggle')
  @HttpCode(HttpStatus.OK)
  async toggleGame(@Param('id') id: string) {
    return this.adminService.toggleGameActive(id);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAuditLogs(entityType, entityId, limit);
  }

  @Get('reports/daily')
  async getDailyReport(@Query('date') date?: string) {
    return this.adminService.generateDailyReport(date);
  }

  @Get('reports/revenue')
  async getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.generateRevenueReport(startDate, endDate);
  }
}
