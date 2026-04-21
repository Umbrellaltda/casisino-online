import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsNumber()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class WithdrawDto {
  @IsNotEmpty()
  @IsNumber()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  @IsString()
  withdrawalMethod: string;

  @IsNotEmpty()
  @IsString()
  accountDetails: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}

export class TransferDto {
  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class WalletBalanceQueryDto {
  @IsOptional()
  @IsString()
  currency?: string = 'BRL';
}
