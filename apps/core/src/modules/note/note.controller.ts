import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { IsOwner } from '@core/common/decorators/role.decorator'
import { Get, Inject } from '@nestjs/common'

import { NoteSchemaSerializeProjection } from './note.protect'
import { NotePublicService } from './note.public.service'
import { NoteService } from './note.service'

@ApiController('notes')
export class NoteController {
  @Inject()
  private readonly service: NoteService

  @Inject()
  private readonly pubService: NotePublicService

  @Get('/latest-id')
  async getLatestNoteId(@IsOwner() isOwner: boolean) {
    return isOwner
      ? this.service.getLatestNoteId()
      : this.pubService.getLatestNoteId()
  }

  @Get('/latest')
  async getLatestNote(@IsOwner() isOwner: boolean) {
    const nid = await this.getLatestNoteId(isOwner)
    if (nid === null) return null
    const data = await this.service.getNoteById(nid)
    if (!isOwner) {
      return NoteSchemaSerializeProjection.serialize(data)
    }

    return data
  }
}
