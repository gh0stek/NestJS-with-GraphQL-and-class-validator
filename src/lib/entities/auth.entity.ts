import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AuthenticationCredentials {
  @Field(() => String)
  authToken!: string

  @Field(() => String, { nullable: true })
  refreshToken?: string | null
}
