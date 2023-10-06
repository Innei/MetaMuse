import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { VisitDocument } from '@core/common/decorators/update-count.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Post } from '@meta-muse/prisma'
import { Get, Param, Query } from '@nestjs/common'

import { CategoryAndSlugDto, PostPagerDto } from './post.dto'
import { PostService } from './post.service'

@ApiController('posts')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Get('/')
  async gets(@Query() query: PostPagerDto) {
    const paginate = await this.service.paginatePosts(query, {
      isPublished: true,
    })
    return paginate
  }

  @Get('/:id')
  async get(@Param() param: SnowflakeIdDto) {
    const { id } = param
    const data = await this.service.getPostById(id)
    this.guardPostCanVisit(data)
    return data
  }

  @Get('/latest')
  @VisitDocument('Post')
  async getLatest() {
    const data = await this.service.getLastPost()
    this.guardPostCanVisit(data)

    return data
  }

  @Get('/:category/:slug')
  @VisitDocument('Post')
  async getByCateAndSlug(@Param() params: CategoryAndSlugDto) {
    const { category, slug } = params

    const data = await this.service.getPostBySlug(slug, category)
    if (!data) {
      throw new BizException(ErrorCodeEnum.PostNotFound)
    }

    this.guardPostCanVisit(data)

    return data
  }

  guardPostCanVisit(data?: Post | null) {
    if (!data) return data
    if (!data.isPublished) {
      throw new BizException(ErrorCodeEnum.PostNotPublished)
    }

    return data
  }
}
