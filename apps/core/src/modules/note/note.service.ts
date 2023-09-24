import { Injectable } from '@nestjs/common'

@Injectable()
export class NoteService {
  async getLatestNoteId() {
    return 32
  }
}
