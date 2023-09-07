import { z } from 'zod'

import { UserModel } from '@core/schemas'
import { createProjectionOmit } from '@core/shared/utils/schema.util'

export const UserSchemaProjection = createProjectionOmit(
  UserModel.shape,
  ['lastLoginIp', 'authCode', 'lastLoginIp', 'lastLoginTime'],
  true,
)

export const UserSchemaSerializeProjection = createProjectionOmit(
  UserModel.shape,
  ['password', 'authCode'],
)

export type UserSchema = z.infer<typeof UserModel>
