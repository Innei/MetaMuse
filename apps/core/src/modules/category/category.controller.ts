import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { Body, Post } from '@nestjs/common'

import { CategoryDto } from './category.dto'
import { CategoryService } from './category.service'

@ApiController('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post('/')
  // @Auth()
  async createCategory(@Body() body: CategoryDto) {
    return this.service.create(body)
  }
}
