import { Prisma } from '@prisma/client'
import { hashText } from '../../src/util/crypto'

export const getCustomers = async (): Promise<
  Prisma.CustomerUpsertArgs['create'][]
> => {
  const password = await hashText('random-password')
  return [
    {
      id: '9e391faf-64b2-4d4c-b879-463532920fd3',
      email: 'user@gmail.com',
      password,
      verified: true,
    },
    {
      id: '9e391faf-64b2-4d4c-b879-463532920fd4',
      email: 'user2@gmail.com',
      password,
      role: 'ADMIN',
      verified: true,
    },
  ]
}
