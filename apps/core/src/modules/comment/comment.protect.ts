import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { Prisma } from '@meta-muse/prisma'
import { CommentSchema } from '@meta-muse/prisma/zod'

export const CommentInclude: Prisma.CommentInclude = {
  children: true,
}

export const CommentSchemaSerializeProjection = createProjectionOmit(
  CommentSchema.shape,
  ['ip'],
)
