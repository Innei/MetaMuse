import { DatabaseService } from '@core/processors/database/database.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class PageService {
  @Inject(DatabaseService)
  private readonly database: DatabaseService

  async getAllPages() {
    return []
  }
}
