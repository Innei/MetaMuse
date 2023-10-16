import { HTTPDecorators } from '@core/common/decorators/http.decorator'
import { IpLocation, IpRecord } from '@core/common/decorators/ip.decorator'
import { IsOwner } from '@core/common/decorators/role.decorator'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Body, Controller, Param, Post } from '@nestjs/common'

import { CreateCommentDto } from './comment.dto'
import { CommentService } from './comment.service'

const idempotenceMessage = '哦吼，这句话你已经说过啦'

@Controller('comment')
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
}
