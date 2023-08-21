import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, MinLength, Matches } from 'class-validator'
import { Match } from '../../decorators'

@InputType()
export class LoginCredentials {
  @IsEmail()
  @Field(() => String, { description: 'Valid user email' })
  email: string

  @MinLength(8)
  @Field(() => String, {
    description: 'Password must be at least 8 characters long.',
  })
  password: string
}

@InputType()
export class ChangePassword {
  @Field(() => String)
  oldPassword!: string

  //https://gist.github.com/arielweinberger/18a29bfa17072444d45adaeeb8e92ddc
  // at least: 1 Upper case, 1 lower case, 1 number or special character
  @Matches(/((?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 Upper case character, 1 Lower case character, and 1 number or special character.',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Field(() => String)
  password!: string

  @Match('password')
  @Field(() => String)
  confirmPassword!: string
}
