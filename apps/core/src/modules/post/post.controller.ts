import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { VisitDocument } from '@core/common/decorators/update-count.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Get, Param, Query } from '@nestjs/common'

import { PostPagerDto } from './post.dto'
import { PostService } from './post.service'

@ApiController('posts')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Get('/')
  async gets(@Query() query: PostPagerDto) {
    const paginate = await this.service.paginatePosts(query)
    return paginate
  }

  @Get('/:id')
  async get(@Param() param: SnowflakeIdDto) {
    const { id } = param
    return this.service.getPostById(id)
  }

  @Get('/latest')
  @VisitDocument('Post')
  async getLatest() {
    return await this.service.getLastPost()
  }

  @Get('/*')
  async notFound() {
    throw new BizException(ErrorCodeEnum.PostNotFound)
  }
}
