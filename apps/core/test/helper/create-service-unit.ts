import { CacheService } from '@core/processors/cache/cache.service'
import { ModuleMetadata } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockedEventManagerServiceProvider } from '@test/mock/helper/helper.event'
import { mockedConfigsServiceProvider } from '@test/mock/modules/configs.mock'
import { MockedDatabaseModule } from '@test/mock/processors/database/database.module'

type ClassType<T> = new (...args: any[]) => T
export const createServiceUnitTestApp = <T>(
  Service: ClassType<T>,
  module?: ModuleMetadata,
) => {
  const proxy = {} as {
    service: T
    app: TestingModule
  }

  beforeAll(async () => {
    const { imports, providers } = module || {}
    const app = await Test.createTestingModule({
      providers: [
        Service,
        mockedEventManagerServiceProvider,
        mockedConfigsServiceProvider,
        {
          provide: CacheService,
          useValue: {},
        },
        ...(providers || []),
      ],
      imports: [MockedDatabaseModule, ...(imports || [])],
    }).compile()
    await app.init()

    const service = app.get<T>(Service)
    proxy.service = service
    proxy.app = app
  })
  return proxy
}
