import { SetMetadata } from '@nestjs/common'

export const NOT_VERIFIED_KEY = 'notVerified'
export const NotVerified = () => SetMetadata(NOT_VERIFIED_KEY, true)
