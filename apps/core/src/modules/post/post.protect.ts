import { z } from 'zod'

import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { Prisma } from '@meta-muse/prisma'
import { PostSchema } from '@meta-muse/prisma/zod'

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

export const PostIncluded: Prisma.PostInclude = {
  category: true,
  tags: true,
  related: {
    select: {
      id: true,
      title: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      slug: true,
      created: true,
    },
  },
}
