import { DatabaseService } from '@core/processors/database/database.service'
import { UrlBuilderService } from '@core/processors/helper/helper.url-builder.service'
import { forwardRef, Inject, Injectable } from '@nestjs/common'

import { PostService } from '../post/post.service'

@Injectable()
export class HelpersService {
  @Inject()
  private readonly urlBuilderService: UrlBuilderService

  @Inject()
  private readonly databaseService: DatabaseService

  @Inject(forwardRef(() => PostService))
  private readonly postService: PostService

  async getModelById(id: string) {
    const populateQuery = (dbModel: (typeof models)[number]) => {
      switch (dbModel.type) {
        case 'post':
          return this.postService.getPostById(id)
        // TODO: add other models
      }
    }

    const models = [
      {
        type: 'post',
        model: this.databaseService.prisma.post,
      },
      {
        type: 'note',
        model: this.databaseService.prisma.note,
      },
      {
        type: 'page',
        model: this.databaseService.prisma.page,
      },
    ] as const

    for (const dbModel of models) {
      const has = await dbModel.model.count({ where: { id } })
      if (has === 1) {
        return populateQuery(dbModel)
      }
    }
  }

  async buildUrlById(id: string) {
    const model = await this.getModelById(id)
    if (!model) {
      return
    }

    return this.urlBuilderService.buildWithBaseUrl(model)
  }
}
