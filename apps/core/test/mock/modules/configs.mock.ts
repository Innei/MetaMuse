import { generateDefaultConfig } from '@core/modules/configs/configs.default'
import { IConfig } from '@core/modules/configs/configs.interface'
import { ConfigsService } from '@core/modules/configs/configs.service'
import { Injectable } from '@nestjs/common'
import { defineProvider } from '@test/helper/defineProvider'

@Injectable()
export class MockedConfigsService {
  private configInitd = false
  public async waitForConfigReady() {
    if (this.configInitd) {
      return await this.getConfig()
    }

    return this.defaultConfig
  }

  public async getConfig(): Promise<Readonly<IConfig>> {
    return this.defaultConfig
  }

  protected async configInit() {
    // TODO
    this.configInitd = true
  }

  public defaultConfig = generateDefaultConfig()

  public get<T extends keyof IConfig>(key: T): Promise<Readonly<IConfig[T]>> {
    return Promise.resolve(this.defaultConfig[key])
  }
}

export const mockedConfigsServiceProvider = defineProvider({
  provide: ConfigsService,
  useValue: new MockedConfigsService(),
})
