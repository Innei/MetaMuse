import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { HTTPDecorators } from '@core/common/decorators/http.decorator'
import { IpLocation, IpRecord } from '@core/common/decorators/ip.decorator'
import { IsOwner } from '@core/common/decorators/role.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Body, Get, Param, Post } from '@nestjs/common'

import { CreateCommentDto } from './comment.dto'
import { CommentService } from './comment.service'

const idempotenceMessage = '哦吼，这句话你已经说过啦'

@ApiController('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:id')
  @HTTPDecorators.Idempotence({
    expired: 20,
    errorMessage: idempotenceMessage,
  })
  async comment(
    @Param() params: SnowflakeIdDto,
    @Body() body: CreateCommentDto,
    @IsOwner() isMaster: boolean,
    @IpLocation() ipLocation: IpRecord,
  ) {
    const comment = await this.commentService.createBaseComment(
      params.id,
      {
        ...body,
        ip: ipLocation.ip,
        agent: ipLocation.agent,
      },
      isMaster ? 'owner' : 'guest',
    )

    this.commentService.appendIpLocation(comment.id, ipLocation.ip)

    return this.commentService
      .fillAndReplaceAvatarUrl([comment])
      .then((docs) => docs[0])
  }

  @Post('/reply/:id')
  @HTTPDecorators.Idempotence({
    expired: 20,
    errorMessage: idempotenceMessage,
  })
  async replyComment(
    @Param() params: SnowflakeIdDto,
    @Body() body: CreateCommentDto,
    @IsOwner() isMaster: boolean,
    @IpLocation() ipLocation: IpRecord,
  ) {
    const comment = await this.commentService.createThreadComment(
      params.id,
      {
        ...body,
        ip: ipLocation.ip,
        agent: ipLocation.agent,
      },
      isMaster ? 'owner' : 'guest',
    )

    this.commentService.appendIpLocation(comment.id, ipLocation.ip)

    return this.commentService
      .fillAndReplaceAvatarUrl([comment])
      .then((docs) => docs[0])
  }

  @Get('/:id')
  async getComments(
    @Param() params: SnowflakeIdDto,
    @IsOwner() isMaster: boolean,
  ) {
    const { id } = params
    const data = await this.commentService.getCommentById(id)

    if (!data) {
      throw new BizException(ErrorCodeEnum.CommentNotFound)
    }
    if (data.isWhispers && !isMaster) {
      throw new BizException(ErrorCodeEnum.CommentNotFound)
    }

    await this.commentService.fillAndReplaceAvatarUrl([data])
    return data
  }
}
