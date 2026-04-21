import { IsNumber, IsString, IsUUID, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO para colocar aposta
 */
export class PlaceBetDto {
  @IsUUID()
  gameId: string;

  @IsNumber()
  @Min(0.1)
  @Max(10000)
  amount: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

/**
 * DTO para resposta de aposta
 */
export class BetResponseDto {
  betId: string;
  gameId: string;
  userId: string;
  amount: number;
  winAmount: number;
  status: string;
  timestamp: Date;
  idempotencyKey: string;
}

/**
 * DTO para depósito
 */
export class DepositDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  paymentMethod: string;
}

/**
 * DTO para saque
 */
export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsUUID()
  pixKey?: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

/**
 * DTO para criação de usuário
 */
export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

/**
 * DTO para login
 */
export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
