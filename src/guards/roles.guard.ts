import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { AuthenticatedUser } from '../auth/types'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ROLES_KEY } from '../decorators'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (!requiredRoles) {
      return true
    }

    const ctx = GqlExecutionContext.create(context)
    const gqlReq = ctx.getContext().req
    const user = gqlReq.user as AuthenticatedUser
    if (!user) {
      return false
    }

    return requiredRoles.includes(user.role)
  }
}
