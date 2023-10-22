import { ApiController } from '@core/common/decorators/api-controller.decorator'

import { CategoryService } from './category.service'

@ApiController('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}
}
