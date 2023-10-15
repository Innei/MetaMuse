import { z } from 'zod'

import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { UserSchema } from '@meta-muse/prisma/zod'

export const UserSchemaProjection = createProjectionOmit(
  UserSchema.shape,
  ['lastLoginIp', 'lastLoginIp', 'lastLoginTime'],
  true,
)

export const UserSchemaSerializeProjection = createProjectionOmit(
  UserSchema.shape,
  ['password', 'lastLoginTime', 'lastLoginIp', 'password'],
)

export type UserSchema = z.infer<typeof UserSchema>
