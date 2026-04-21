import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppError, ErrorCodes, UserStatus } from '@shared/types';

/**
 * Guard para autenticação JWT
 */
export const JwtAuthGuard = AuthGuard('jwt');

/**
 * Factory para criar guards de roles dinâmicos
 */
export function RolesGuard(...roles: string[]): Type<CanActivate> {
  @Injectable()
  class MixinRolesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new AppError(ErrorCodes.USER_NOT_FOUND, 401, 'Usuário não autenticado');
      }

      if (!roles.includes(user.role)) {
        throw new AppError(
          ErrorCodes.KYC_REQUIRED,
          403,
          'Acesso negado: permissões insuficientes',
        );
      }

      return true;
    }
  }

  return mixin(MixinRolesGuard);
}

/**
 * Guard para verificar status KYC do usuário
 */
@Injectable()
export class KycRequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, 401, 'Usuário não autenticado');
    }

    if (user.status !== UserStatus.KYC_APPROVED && user.status !== UserStatus.ACTIVE) {
      throw new AppError(
        ErrorCodes.KYC_REQUIRED,
        403,
        'KYC necessário para realizar esta operação',
      );
    }

    return true;
  }
}

/**
 * Guard para verificar se jogo está ativo
 */
@Injectable()
export class GameActiveGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const game = request.game;

    if (!game) {
      throw new AppError(ErrorCodes.GAME_NOT_FOUND, 404, 'Jogo não encontrado');
    }

    // Verificar status do jogo seria feito aqui
    // if (game.status !== GameStatus.ACTIVE) { ... }

    return true;
  }
}
