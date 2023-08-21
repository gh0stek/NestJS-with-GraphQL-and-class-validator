import { Module, Request, Response } from '@nestjs/common'
import { GraphQLModule, GqlContextType } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { join } from 'path'
import { PrismaService } from './prisma.service'
import { CustomerModule } from './customer/customer.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    CustomerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      // add ts types to function bellow
      context: ({ request, reply }: { request: Request; reply: Response }) => ({
        request,
        reply,
      }),
      playground: true,
      introspection: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
