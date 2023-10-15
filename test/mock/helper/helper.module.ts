import { HttpService } from '@core/processors/helper/services/helper.http.servicep.service'
import { JWTService } from '@core/processors/helper/services/helper.jwt.servicet.service'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Global, Module } from '@nestjs/common'

import { mockedEventManagerServiceProvider } from './helper.event'
import { tRPCService as mockTrpcSerivce } from './helper.trpc'

@Module({
  providers: [
    mockedEventManagerServiceProvider,
    JWTService,
    HttpService,
    {
      provide: tRPCService,
      useClass: mockTrpcSerivce,
    },
  ],
  exports: [
    mockedEventManagerServiceProvider,
    JWTService,
    HttpService,

    {
      provide: tRPCService,
      useClass: mockTrpcSerivce,
    },
  ],
})
@Global()
export class MockedHelperModule {}
