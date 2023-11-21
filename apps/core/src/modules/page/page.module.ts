import { Module } from '@nestjs/common'

import { PageController } from './page.controller'
import { PageService } from './page.service'
import { PageTrpcRouter } from './page.trpc'

@Module({
  controllers: [PageController],
  providers: [PageService, PageTrpcRouter],
  exports: [PageService, PageTrpcRouter],
})
export class PageModule {}
