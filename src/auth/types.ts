import { UserRole } from '@prisma/client'

export type AuthenticatedUser = {
  userId: string
  role: UserRole
  verified: boolean
}

export type JWTPayload = {
  userId: string
  role: UserRole
  refresh: boolean
  verified: boolean
}
