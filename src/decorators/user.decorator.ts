import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedUser } from '../auth/types'
import { GqlExecutionContext } from '@nestjs/graphql'

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const ctx = GqlExecutionContext.create(context)
    const gqlReq = ctx.getContext().req
    return gqlReq.user as AuthenticatedUser
  },
)
