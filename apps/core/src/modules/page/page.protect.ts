import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { PageSchema } from '@meta-muse/prisma/zod'

export const PageSchemaProjection = createProjectionOmit(
  PageSchema.shape,
  [],
  true,
)
