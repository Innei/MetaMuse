import { DatabaseService } from '@core/processors/database/database.service'
import { EmailService } from '@core/processors/helper/services/helper.email.service'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { UserSchemaSerializeProjection } from '../user/user.protect'
import { UserService } from '../user/user.service'
import { baseRenderProps } from './comment.email.default'
import { CommentReplyMailType } from './comment.enum'

@Injectable()
export class CommentService implements OnModuleInit {
  @Inject()
  private readonly databaseService: DatabaseService

  @Inject()
  private readonly userService: UserService

  @Inject()
  private readonly emailService: EmailService

  private async getMailOwnerProps() {
    const masterInfo = await this.userService.getOwner()
    return UserSchemaSerializeProjection.serialize(masterInfo)
  }

  async onModuleInit() {
    const ownerInfo = await this.getMailOwnerProps()
    const renderProps = {
      ...baseRenderProps,

      master: ownerInfo.name,

      aggregate: {
        ...baseRenderProps.aggregate,
        owner: ownerInfo,
      },
    }
    this.emailService.registerEmailType(CommentReplyMailType.Guest, {
      ...renderProps,
    })
    this.emailService.registerEmailType(CommentReplyMailType.Owner, {
      ...renderProps,
    })
  }
}
