import { Module } from '@nestjs/common'

import { ToolTrpcRouter } from './tool.trpc'

@Module({
  providers: [ToolTrpcRouter],
  exports: [ToolTrpcRouter],
})
export class ToolModule {}
