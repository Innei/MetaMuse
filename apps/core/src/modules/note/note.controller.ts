import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { Inject } from '@nestjs/common'

import { NoteService } from './note.service'

@ApiController('note')
export class NoteController {
  @Inject()
  private readonly service: NoteService
}
