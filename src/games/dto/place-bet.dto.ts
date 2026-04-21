import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PlaceBetDto {
  @IsNotEmpty()
  @IsString()
  gameId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsString()
  betType: string;

  @IsOptional()
  @IsString()
  betData?: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}

export class CashOutDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}

export class GameHistoryDto {
  @IsOptional()
  @IsString()
  gameId?: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}
