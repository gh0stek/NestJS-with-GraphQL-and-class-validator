import { Field, InputType, Int } from '@nestjs/graphql'
import { Prisma, Customer, UserRole } from '@prisma/client'
import { IsEmail, MinLength, Matches, IsOptional } from 'class-validator'

@InputType()
export class WhereCustomerInput {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => Date, { nullable: true })
  createdAt?: Date

  @Field(() => Date, { nullable: true })
  updatedAt?: Date
}

@InputType()
export class GetCustomerInput {
  @Field(() => String, { nullable: true })
  cursor?: Prisma.CustomerWhereUniqueInput

  @Field(() => Int, { nullable: true })
  skip?: number

  @Field(() => Int, { nullable: true })
  take?: number

  @Field(() => WhereCustomerInput, { nullable: true })
  where?: WhereCustomerInput
}

@InputType()
export class RegisterCustomerInput
  implements Pick<Customer, 'email' | 'password'>
{
  @IsEmail()
  @Field(() => String)
  email!: string

  @Matches(/((?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 Upper case character, 1 Lower case character, and 1 number or special character.',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Field(() => String)
  password!: string
}

@InputType()
export class CreateCustomerInput extends RegisterCustomerInput {
  @Field(() => String)
  role!: UserRole
}

@InputType()
export class UpdateCustomerInput implements Partial<CreateCustomerInput> {
  @IsOptional()
  @IsEmail()
  @Field(() => String, { nullable: true })
  email?: string

  @IsOptional()
  @Matches(/((?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 Upper case character, 1 Lower case character, and 1 number or special character.',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Field(() => String, { nullable: true })
  password?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  role?: UserRole
}
