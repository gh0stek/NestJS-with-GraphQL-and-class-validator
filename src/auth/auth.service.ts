import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Customer, UserRole } from '@prisma/client'

import { PrismaService } from 'src/prisma.service'

import { getLogger } from '../logging'
import { LoginCredentials, ChangePassword } from './dto/auth.input'
import { JWTPayload } from './types'
import { hashText, verifyTextWithHash } from '../util/crypto'
import { AuthenticationCredentials } from '../lib/entities/auth.entity'

const logger = getLogger('AuthService')

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(
    loginCredentials: LoginCredentials,
  ): Promise<AuthenticationCredentials> {
    logger.info(`Attempting to login user ${loginCredentials.email}`, {
      username: loginCredentials.email,
    })

    const user = await this.prisma.customer.findFirst({
      where: {
        email: loginCredentials.email.toLowerCase(),
      },
    })
    if (!user) {
      logger.info(
        `Failed login attempt for user ${loginCredentials.email} due to user not found`,
      )
      throw new HttpException(
        'Invaild email or password. Please try again.',
        HttpStatus.UNAUTHORIZED,
      )
    }

    if (!(await verifyTextWithHash(loginCredentials.password, user.password))) {
      logger.info(
        `Failed login attempt for user ${loginCredentials.email} due to bad password`,
      )
      throw new HttpException(
        'Invaild email or password. Please try again.',
        HttpStatus.UNAUTHORIZED,
      )
    }

    logger.info(`Successful login attempt for  ${loginCredentials.email}`, {
      username: loginCredentials.email,
    })
    return await this.generateCredentials(user)
  }

  async refreshToken(refreshToken: string): Promise<AuthenticationCredentials> {
    try {
      this.jwtService.verify(refreshToken)
    } catch (error) {
      logger.error('Unable to verify refreshToken', {
        refreshToken,
        error,
      })
    }

    let decodedPayload: JWTPayload | undefined | null = null
    try {
      decodedPayload = <JWTPayload>this.jwtService.decode(refreshToken)
    } catch (error) {
      logger.error('Unable to decode refreshToken', {
        refreshToken,
        error,
      })
      throw new HttpException(
        'Please try logging in again.',
        HttpStatus.UNAUTHORIZED,
      )
    }
    const userId = decodedPayload.userId

    const user = await this.prisma.customer.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) {
      logger.info(`Failed login refresh user`)
      throw new HttpException(
        'Please try logging in again.',
        HttpStatus.UNAUTHORIZED,
      )
    }

    if (!user.refreshToken) {
      throw new HttpException(
        'Please try logging in again.',
        HttpStatus.UNAUTHORIZED,
      )
    }

    if (!(await verifyTextWithHash(refreshToken, user.refreshToken))) {
      logger.info(
        `User tried logging in with invalid refresh token ${userId}`,
        { userId },
      )
      throw new HttpException(
        'Please try logging in again.',
        HttpStatus.UNAUTHORIZED,
      )
    }

    return await this.generateCredentials(user)
  }

  async changePassword(
    userId: string,
    changePassword: ChangePassword,
  ): Promise<void> {
    logger.info(`Updaing password for user ${userId}`, { userId })
    const user = await this.prisma.customer.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) {
      logger.error('User not found while trying to change password')
      throw new HttpException('Please contact support.', HttpStatus.NOT_FOUND)
    }

    if (
      !(await verifyTextWithHash(changePassword.oldPassword, user.password))
    ) {
      logger.info(
        `Password does not match for user ${userId} trying to change password`,
        {
          userId,
        },
      )
      throw new HttpException(
        'Please check your password and try again.',
        HttpStatus.BAD_REQUEST,
      )
    }

    const passwordHash = await hashText(changePassword.password)
    await this.prisma.customer.update({
      where: {
        id: userId,
      },
      data: {
        password: passwordHash,
      },
    })
    logger.info(`Password changed for user ${userId}`, { userId })
  }

  private async generateCredentials(
    user: Customer,
  ): Promise<AuthenticationCredentials> {
    const payload: JWTPayload = {
      userId: user.id,
      role: user.role as UserRole,
      refresh: true,
      verified: user.verified,
    }
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '12h' })
    await this.prisma.customer.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: await hashText(refreshToken),
      },
    })

    return {
      authToken: this.jwtService.sign(
        { ...payload, refresh: false },
        { expiresIn: '1h' },
      ),
      refreshToken,
    }
  }

  public async logout(userId: string): Promise<void> {
    await this.prisma.customer.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    })
  }

  public async generateVerificationCode(userId: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    logger.info(`Generating verification code for user ${userId}`, { code })
    await this.prisma.verificationCode.create({
      data: {
        customer: {
          connect: {
            id: userId,
          },
        },
        code,
      },
    })
  }

  public async verifyCode(userId: string, code: string): Promise<void> {
    logger.info(`Verifying code for user ${userId}`, { userId })

    await this.prisma.$transaction(async (transaction) => {
      const verificationCode = await transaction.verificationCode.findFirst({
        where: {
          customerId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (!verificationCode || verificationCode.code !== code) {
        logger.info(`Code not found for user ${userId}`, { userId })
        throw new HttpException(
          'Invalid code. Please try again.',
          HttpStatus.BAD_REQUEST,
        )
      }

      await transaction.customer.update({
        where: {
          id: userId,
        },
        data: {
          verified: true,
        },
      })
    })
  }
}
