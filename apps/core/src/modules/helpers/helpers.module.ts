import { forwardRef, Module } from '@nestjs/common'

import { PostModule } from '../post/post.module'
import { HelpersController } from './helpers.controller'
import { HelpersService } from './helpers.service'
import { HelpersTrpcRouter } from './helpers.trpc'

@Module({
  controllers: [HelpersController],
  exports: [HelpersService, HelpersTrpcRouter],
  providers: [HelpersService, HelpersTrpcRouter],
  imports: [forwardRef(() => PostModule)],
})
export class HelpersModule {}
