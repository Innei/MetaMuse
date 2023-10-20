import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { IpLocation, IpRecord } from '@core/common/decorators/ip.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ArticleType } from '@core/constants/article.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { CountingService } from '@core/processors/helper/services/helper.counting.service'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Post } from '@meta-muse/prisma'
import { Get, Param, Query } from '@nestjs/common'

import { CategoryAndSlugDto, PostPagerDto } from './post.dto'
import { PostService } from './post.service'

@ApiController('posts')
export class PostController {
  constructor(
    private readonly service: PostService,
    private readonly countingService: CountingService,
  ) {}

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
  async getLatest(@IpLocation() ip: IpRecord) {
    const data = await this.service.getLastPost()
    if (!data) return null
    this.guardPostCanVisit(data)
    this.countingService.updateReadCount(ArticleType.Post, data.id, ip.ip)

    return data
  }

  @Get('/:category/:slug')
  async getByCateAndSlug(
    @Param() params: CategoryAndSlugDto,
    @IpLocation() ip: IpRecord,
  ) {
    const { category, slug } = params

    const data = await this.service.getPostBySlug(slug, category)
    if (!data) {
      throw new BizException(ErrorCodeEnum.PostNotFound)
    }

    this.guardPostCanVisit(data)
    this.countingService.updateReadCount(ArticleType.Post, data.id, ip.ip)

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
