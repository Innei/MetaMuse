import { Global, Module } from '@nestjs/common'

import { ConfigsService } from './configs.service'

@Global()
@Module({
  exports: [ConfigsService],
  providers: [ConfigsService],
})
export class ConfigsModule {}
