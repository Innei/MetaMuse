import { isDev } from '@core/global/env.global'
import { Global, Module, Provider } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter/dist/event-emitter.module'
import { ThrottlerModule } from '@nestjs/throttler'

import { AssetService } from './helper.asset.service'
import { EventManagerService } from './helper.event.service'
import { HttpService } from './helper.http.service'
import { ImageService } from './helper.image.service'
import { JWTService } from './helper.jwt.service'
import { UploadService } from './helper.upload.service'
import { UrlBuilderService } from './helper.url-builder.service'

const providers: Provider<any>[] = [
  AssetService,
  EventManagerService,
  HttpService,
  ImageService,
  JWTService,
  UrlBuilderService,
  UploadService,
]

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: isDev,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
  ],

  providers,
  exports: providers,
})
@Global()
export class HelperModule {}
