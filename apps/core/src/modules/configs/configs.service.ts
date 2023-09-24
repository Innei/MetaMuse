import { Injectable } from '@nestjs/common'

import { SeoDto, UrlDto } from './configs.dto'
import { IConfig } from './configs.interface'

@Injectable()
export class ConfigsService {
  public get<T extends keyof IConfig>(key: T): Promise<Readonly<IConfig[T]>> {
    return Promise.resolve(
      {
        url: {
          webUrl: 'https://example.com',
        } as UrlDto,
        seo: {
          title: '静かな森',
        } as SeoDto,
      }[key],
    )
  }
}
