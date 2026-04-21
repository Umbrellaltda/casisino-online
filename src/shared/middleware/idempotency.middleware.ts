import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '@shared/types';
import { hashIdempotencyKey } from '@shared/utils/helpers';
import { REDIS_CONFIG, IDEMPOTENCY_CONFIG } from '@shared/constants';

export interface IdempotentRequest extends Request {
  idempotencyKey?: string;
}

/**
 * Middleware para garantir idempotência em requisições de aposta
 * Previne processamento duplicado da mesma operação
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private redisClient: any; // Inject Redis client in production

  use(req: IdempotentRequest, res: Response, next: NextFunction): void {
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    
    if (!idempotencyKey) {
      // Para endpoints que requerem idempotência, rejeita sem a chave
      if (this.requiresIdempotency(req.path)) {
        throw new AppError(
          ErrorCodes.DUPLICATE_REQUEST,
          400,
          'Chave de idempotência requerida',
        );
      }
      return next();
    }

    req.idempotencyKey = hashIdempotencyKey(idempotencyKey);
    
    // Em produção: verificar no Redis se já existe resposta cached
    // this.checkIdempotencyCache(req.idempotencyKey, res, next);
    
    next();
  }

  /**
   * Define quais endpoints requerem idempotência obrigatória
   */
  private requiresIdempotency(path: string): boolean {
    const idempotentPaths = [
      '/api/bets',
      '/api/games/*/spin',
      '/api/wallet/withdraw',
      '/api/transactions',
    ];
    
    return idempotentPaths.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(path);
    });
  }

  /**
   * Verifica cache de idempotência no Redis
   * Se existir, retorna resposta cached
   */
  private async checkIdempotencyCache(
    key: string,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // Implementação com Redis em produção
    const redisKey = `${REDIS_CONFIG.IDEMPOTENCY_PREFIX}${key}`;
    
    // Pseudo-código:
    // const cached = await this.redisClient.get(redisKey);
    // if (cached) {
    //   const parsed = JSON.parse(cached);
    //   return res.status(parsed.status).json(parsed.body);
    // }
    
    // Intercepta resposta para caching
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // this.cacheResponse(redisKey, res.statusCode, body);
      return originalJson(body);
    };
    
    next();
  }

  /**
   * Cacheia resposta no Redis com TTL configurado
   */
  private async cacheResponse(
    key: string,
    status: number,
    body: any,
  ): Promise<void> {
    const ttlSeconds = IDEMPOTENCY_CONFIG.WINDOW_SECONDS;
    
    // Pseudo-código:
    // await this.redisClient.setex(
    //   key,
    //   ttlSeconds,
    //   JSON.stringify({ status, body })
    // );
  }
}
