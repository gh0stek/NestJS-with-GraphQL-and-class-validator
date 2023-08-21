import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { AuthenticatedUser } from '../auth/types'
import { GqlExecutionContext } from '@nestjs/graphql'
import { NOT_VERIFIED_KEY } from '../decorators'

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowNotVerified = this.reflector.getAllAndOverride<UserRole[]>(
      NOT_VERIFIED_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (allowNotVerified) {
      return true
    }
    const ctx = GqlExecutionContext.create(context)
    const gqlReq = ctx.getContext().req
    const user = gqlReq.user as AuthenticatedUser

    if (user?.verified) {
      return true
    }

    throw new HttpException('User not verified', HttpStatus.UNAUTHORIZED)
  }
}
