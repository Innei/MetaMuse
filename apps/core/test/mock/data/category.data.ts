import { omit } from 'lodash'
import { createFixture } from 'zod-fixture'

import { categorySchemaProjection } from '@core/modules/category/category.project'
import { CategorySchema } from '@meta-muse/prisma/zod'

export const generateMockCategory = () => {
  return omit(
    createFixture(CategorySchema, {}),
    ...categorySchemaProjection.keys,
  )
}

const mockCategoryInputData1 = createFixture(CategorySchema)

export { mockCategoryInputData1 }
