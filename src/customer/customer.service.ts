import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import {
  GetCustomerInput,
  CreateCustomerInput,
  UpdateCustomerInput,
  RegisterCustomerInput,
} from './dto/customer.input'
import { getLogger } from '../logging'
import { hashText } from '../util/crypto'

const logger = getLogger('CustomerService')

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}
  async findAll(params: GetCustomerInput) {
    const { skip, take, cursor, where } = params

    logger.debug('Finding customers', params)
    try {
      return await this.prisma.customer.findMany({
        skip,
        take,
        cursor,
        where,
      })
    } catch (err) {
      logger.error('Error while finding customers', err)
      throw new HttpException('Customers not found', HttpStatus.NOT_FOUND)
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.customer.findUnique({
        where: {
          id,
        },
      })
    } catch (err) {
      logger.error('Error while finding customer', err)
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND)
    }
  }

  async create(data: CreateCustomerInput) {
    return await this.prisma.customer.create({
      data: {
        ...data,
        password: await hashText(data.password),
      },
    })
  }

  async update(id: string, data: UpdateCustomerInput) {
    try {
      return await this.prisma.customer.update({
        where: {
          id,
        },
        data: {
          ...data,
          password: data.password ? await hashText(data.password) : undefined,
        },
      })
    } catch (err) {
      logger.error('Error while updating customer', err)
      throw new HttpException(
        'Customer not found or invalid data provided',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.customer.delete({
        where: {
          id,
        },
      })
    } catch (err) {
      logger.error('Error while deleting customer', err)
      throw new HttpException(
        'Customer not found or invalid data provided',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async register(data: RegisterCustomerInput) {
    try {
      return await this.prisma.customer.create({
        data: {
          ...data,
          password: await hashText(data.password),
          role: undefined,
          verified: undefined,
        },
      })
    } catch (err) {
      logger.error('Error while registering customer', err)
      throw new HttpException('Invalid data provided', HttpStatus.BAD_REQUEST)
    }
  }
}
