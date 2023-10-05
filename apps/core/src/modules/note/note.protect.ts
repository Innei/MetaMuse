import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { Prisma } from '@meta-muse/prisma'
import { NoteSchema } from '@meta-muse/prisma/zod'

export const NoteIncluded: Prisma.NoteInclude = {
  topic: true,
}

export const NoteSchemaProjection = createProjectionOmit(
  NoteSchema.shape,
  [],
  true,
)
export const NoteSchemaSerializeProjection = createProjectionOmit(
  NoteSchema.shape,
  ['password', 'coordinates', 'location'],
)
