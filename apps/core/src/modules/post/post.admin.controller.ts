import { AdminApiController } from '@core/common/decorators/api-controller.decorator'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Body, Get, Param, Post, Query } from '@nestjs/common'

import { PostDto, PostPagerDto } from './post.dto'
import { PostService } from './post.service'

@AdminApiController('posts')
export class PostAdminController {
  constructor(private readonly service: PostService) {}

  @Get('/')
  async gets(@Query() query: PostPagerDto) {
    const paginate = await this.service.paginatePosts(query)
    return paginate
  }

  @Post('/')
  async create(@Body() body: PostDto) {
    return this.service.create(body)
  }

  @Get('/:id')
  async getById(@Param() params: SnowflakeIdDto) {
    const { id } = params
    const doc = await this.service.getPostById(id)

    return doc
  }
}
