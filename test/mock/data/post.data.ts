import { omit } from 'lodash'
import { createFixture } from 'zod-fixture'

import { PostSchemaProjection } from '@core/modules/post/post.protect'
import { PostSchema } from '@prisma/client/zod'

export const generateMockPost = () => {
  return omit(createFixture(PostSchema), ...PostSchemaProjection.keys)
}
const mockPostInputData = generateMockPost()

export { mockPostInputData }
