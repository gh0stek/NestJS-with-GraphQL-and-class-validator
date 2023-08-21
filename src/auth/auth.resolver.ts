import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { LoginCredentials, ChangePassword } from './dto/auth.input'
import { AuthenticationCredentials } from '../lib/entities/auth.entity'
import { AuthenticatedUser } from './types'
import { User, Public, NotVerified } from '../decorators'

@Resolver(() => AuthenticationCredentials)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @NotVerified()
  @Public()
  @Mutation(() => AuthenticationCredentials)
  login(@Args('credentials') credentials: LoginCredentials) {
    return this.authService.login(credentials)
  }

  @NotVerified()
  @Mutation(() => AuthenticationCredentials)
  changePassword(
    @User() user: AuthenticatedUser,
    @Args('credentials') credentials: ChangePassword,
  ) {
    return this.authService.changePassword(user.userId, credentials)
  }

  @NotVerified()
  @Public()
  @Mutation(() => AuthenticationCredentials)
  refreshToken(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
  ) {
    return this.authService.refreshToken(refreshToken)
  }

  @NotVerified()
  @Mutation(() => Boolean)
  async logout(@User() user: AuthenticatedUser) {
    await this.authService.logout(user.userId)
    return true
  }

  @NotVerified()
  @Mutation(() => Boolean)
  async generateVerificationCode(@User() user: AuthenticatedUser) {
    await this.authService.generateVerificationCode(user.userId)
    return true
  }

  @NotVerified()
  @Mutation(() => Boolean)
  async verifyCode(
    @User() user: AuthenticatedUser,
    @Args('code', { type: () => String }) code: string,
  ) {
    await this.authService.verifyCode(user.userId, code)
    return true
  }
}
