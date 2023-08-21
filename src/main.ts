import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { PrismaService } from './prisma.service'
import { WinstonModule } from 'nest-winston'
import { getLoggingOptions } from './logging'
import { ValidationPipe } from '@nestjs/common'

const port = process.env.PORT ?? 8080

async function bootstrap() {
  process.env.DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?schema=${process.env.DB_SCHEMA}&sslmode=prefer`
  process.env.SHADOW_DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?schema=dbmigration&sslmode=prefer`

  const logger = WinstonModule.createLogger(getLoggingOptions('Main'))
  const app = await NestFactory.create(AppModule, {
    logger,
    cors: true,
  })
  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)
  const config = new DocumentBuilder()
    .setTitle('Service Example')
    .setDescription('Service that can be used for boiler plating')
    .setVersion('1.0')
    .addTag('example')
    .addTag('default')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.startAllMicroservices()
  app.enableCors({
    allowedHeaders: ['Content-Type'],
    exposedHeaders: [
      'Content-Type',
      'ETag',
      'Content-Length',
      'Access-Control-Allow-Origin',
    ],
  })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  await app.listen(port, () => logger.log(`App listening on the port ${port}`))
}
bootstrap()
