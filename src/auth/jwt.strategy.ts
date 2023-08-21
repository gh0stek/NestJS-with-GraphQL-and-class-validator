import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'

import { JWTPayload } from './types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    })
  }

  async validate(payload: JWTPayload) {
    if (payload.refresh) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED)
    }
    return {
      userId: payload.userId,
      role: payload.role,
      verified: payload.verified,
    }
  }
}
