import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

/**
 * Módulo de Auth - Gerencia autenticação, autorização e KYC
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
  ],
  providers: [],
  controllers: [],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
