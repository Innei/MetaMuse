import { HttpService } from '@core/processors/helper/services/helper.http.service'
import { JWTService } from '@core/processors/helper/services/helper.jwt.service'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Global, Module } from '@nestjs/common'

import { mockedEventManagerServiceProvider } from './helper.event'
import { tRPCService as mockTrpcService } from './helper.trpc'

@Module({
  providers: [
    mockedEventManagerServiceProvider,
    JWTService,
    HttpService,
    {
      provide: tRPCService,
      useClass: mockTrpcService,
    },
  ],
  exports: [
    mockedEventManagerServiceProvider,
    JWTService,
    HttpService,

    {
      provide: tRPCService,
      useClass: mockTrpcService,
    },
  ],
})
@Global()
export class MockedHelperModule {}
