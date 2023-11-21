import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { IsOwner } from '@core/common/decorators/role.decorator'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Get, Inject, Param, Query } from '@nestjs/common'

import { NoteNidParamDto, NotePagerDto, NoteRankQueryDto } from './note.dto'
import { NoteSchemaSerializeProjection } from './note.protect'
import { NotePublicService } from './note.public.service'
import { NoteService } from './note.service'

@ApiController('notes')
export class NoteController {
  @Inject()
  private readonly service: NoteService

  @Inject()
  private readonly pubService: NotePublicService

  private integratedServices(isOwner: boolean) {
    return isOwner ? this.service : this.pubService
  }

  @Get('/latest-id')
  async getLatestNoteId(@IsOwner() isOwner: boolean) {
    return this.integratedServices(isOwner).getLatestNoteId()
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

  @Get('/')
  async gets(@Query() query: NotePagerDto) {
    const paginate = await this.service.paginateNotes(query, {
      isPublished: true,
    })
    return paginate
  }

  @Get('/:id')
  async getNoteById(
    @Param() params: SnowflakeIdDto,
    @IsOwner() isOwner: boolean,
  ) {
    return this.integratedServices(isOwner).getNoteById(params.id)
  }

  @Get('/nid/:id')
  async getNoteByNId(
    @Param() params: NoteNidParamDto,
    @IsOwner() isOwner: boolean,
  ) {
    return this.integratedServices(isOwner).getNoteById(params.nid)
  }

  @Get('/rank/:id')
  async getNoteRank(
    @IsOwner() isOwner: boolean,
    @Query() query: NoteRankQueryDto,

    @Param() params: SnowflakeIdDto,
  ) {
    const { size = 10 } = query
    const { id } = params

    return this.service.queryNoteRanking(id, size, isOwner)
  }

  @Get('/object/:id')
  async getNoteObject(@Param() params: SnowflakeIdDto) {
    // Object builder
  }
}
