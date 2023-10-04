import { URL } from 'url'

import { ConfigsService } from '@core/modules/configs/configs.service'
import { isDefined } from '@core/shared/utils/validator.util'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UrlBuilderService {
  constructor(private readonly configsService: ConfigsService) {}
  isPostModel(model: any): model is NormalizedPostModel {
    return (
      isDefined(model.title) &&
      isDefined(model.slug) &&
      isDefined(model.categoryId)
    )
  }

  build(model: NormalizedPostModel) {
    if (this.isPostModel(model)) {
      return `/posts/${encodeURIComponent(
        model.category.slug,
      )}/${encodeURIComponent(model.slug)}`
    }

    return '/'
  }

  async buildWithBaseUrl(model: NormalizedPostModel) {
    const {
      url: { webUrl: baseURL },
    } = await this.configsService.waitForConfigReady()

    return new URL(this.build(model), baseURL).href
  }
}
