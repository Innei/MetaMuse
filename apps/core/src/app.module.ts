import { Module, Type } from '@nestjs/common'
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
  HttpAdapterHost,
} from '@nestjs/core'
import { ThrottlerGuard } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AllExceptionsFilter } from './common/filters/all-exception.filter'
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter'
import { RolesGuard } from './common/guards/role.guard'
import { HttpCacheInterceptor } from './common/interceptors/cache.interceptor'
import { IdempotenceInterceptor } from './common/interceptors/idempotence.interceptor'
import { JSONTransformerInterceptor } from './common/interceptors/json-transformer.interceptor'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe'
import { AggregateModule } from './modules/aggregate/aggregate.module'
import { ArticleModule } from './modules/article/article.module'
import { AuthModule } from './modules/auth/auth.module'
import { CategoryModule } from './modules/category/category.module'
import { CommentModule } from './modules/comment/comment.module'
import { ConfigsModule } from './modules/configs/configs.module'
import { FileModule } from './modules/file/file.module'
import { HelpersModule } from './modules/helpers/helpers.module'
import { NoteModule } from './modules/note/note.module'
import { PageModule } from './modules/page/page.module'
import { PostModule } from './modules/post/post.module'
import { ToolModule } from './modules/tool/tool.module'
import { TopicModule } from './modules/topic/topic.module'
import { UserModule } from './modules/user/user.module'
import { CacheModule } from './processors/cache/cache.module'
import { DatabaseModule } from './processors/database/database.module'
import { GatewayModule } from './processors/gateway/gateway.module'
import { HelperModule } from './processors/helper/helper.module'
import { LoggerModule } from './processors/logger/logger.module'
import { tRPCModule } from './processors/trpc/trpc.module'

// Request ----->
// Response <-----
const appInterceptors: Type<any>[] = [
  IdempotenceInterceptor,
  HttpCacheInterceptor,
  JSONTransformerInterceptor,

  ResponseInterceptor,
]
@Module({
  imports: [
    // processors
    CacheModule,
    DatabaseModule,
    HelperModule,
    LoggerModule,
    GatewayModule,

    // BIZ
    AggregateModule,
    AuthModule,
    PostModule,
    UserModule,
    CommentModule,
    CategoryModule,
    ConfigsModule,
    NoteModule,
    HelpersModule,
    PageModule,
    TopicModule,
    FileModule,
    ArticleModule,
    ToolModule,

    // waiting for all biz modules loaded
    tRPCModule,
  ],
  controllers: [AppController],
  providers: [
    ...appInterceptors.map((interceptor) => ({
      provide: APP_INTERCEPTOR,
      useClass: interceptor,
    })),

    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    {
      provide: APP_FILTER,
      useFactory: ({ httpAdapter }: HttpAdapterHost) => {
        return new PrismaClientExceptionFilter(httpAdapter)
      },
      inject: [HttpAdapterHost],
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
