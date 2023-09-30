import { Global, Module } from '@nestjs/common'

import { ConfigsService } from './configs.service'
import { ConfigsTRPCRouter } from './configs.trpc'

@Global()
@Module({
  exports: [ConfigsService, ConfigsTRPCRouter],
  providers: [ConfigsService, ConfigsTRPCRouter],
})
export class ConfigsModule {}
