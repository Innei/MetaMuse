import { Global, Module, Provider } from '@nestjs/common'

export const createMockGlobalModule = (providers: Provider[]) => {
  @Global()
  @Module({
    providers,
    exports: providers,
  })
  class MockGlobalModule {}

  return MockGlobalModule
}
