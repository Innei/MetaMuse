import { z } from 'zod'

import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { PostSchema } from '@prisma/client/zod'

export const PostSchemaProjection = createProjectionOmit(
  PostSchema.shape,
  [],
  true,
)
export const PostSchemaSerializeProjection = createProjectionOmit(
  PostSchema.shape,
  [],
)

export type PostInputSchema = Omit<
  z.infer<typeof PostSchema>,
  keyof typeof PostSchemaProjection
>
