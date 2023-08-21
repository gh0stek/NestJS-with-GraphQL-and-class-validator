import { Args, Query, Resolver, Mutation } from '@nestjs/graphql'
import { Customer } from 'lib/entities/customer.entity'
import { CustomerService } from './customer.service'
import {
  GetCustomerInput,
  RegisterCustomerInput,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './dto/customer.input'
import { User, Public, Roles, NotVerified } from '../decorators'
import { AuthenticatedUser } from '../auth/types'

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => [Customer])
  async customers(@Args('data') params: GetCustomerInput) {
    return this.customerService.findAll(params)
  }

  @NotVerified()
  @Query(() => Customer)
  async me(@User() user: AuthenticatedUser) {
    return this.customerService.findOne(user.userId)
  }

  @Public()
  @Mutation(() => Customer)
  async register(@Args('data') data: RegisterCustomerInput) {
    return this.customerService.register(data)
  }

  @Roles('ADMIN')
  @Mutation(() => Customer)
  async create(@Args('data') data: CreateCustomerInput) {
    return this.customerService.create(data)
  }

  @Roles('ADMIN')
  @Mutation(() => Customer)
  async update(
    @Args('id', { type: () => String }) id: string,
    @Args('data') data: UpdateCustomerInput,
  ) {
    return this.customerService.update(id, data)
  }

  @Roles('ADMIN')
  @Mutation(() => Customer)
  async delete(@Args('id', { type: () => String }) id: string) {
    return this.customerService.delete(id)
  }
}
