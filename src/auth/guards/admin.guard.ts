import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const isValid = super.canActivate(context);

    if (!isValid) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    // Check if user has admin or superadmin role
    const adminRoles = ['admin', 'superadmin'];
    const hasAdminRole = user.roles?.some((role: string) => adminRoles.includes(role));

    return hasAdminRole;
  }
}
