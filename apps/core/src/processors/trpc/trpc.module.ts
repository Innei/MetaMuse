import { Global, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import { tRPCService } from './trpc.service'

@Module({
  exports: [tRPCService],
  providers: [tRPCService],
  imports: [DiscoveryModule],
})
@Global()
export class tRPCModule {}
