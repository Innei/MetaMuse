import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { UserSchema } from '@meta-muse/prisma/zod'

import { UserSchemaProjection } from '../user.protect'

export class UserRegisterDto extends createZodDto(
  UserSchema.omit(UserSchemaProjection).extend({
    socialIds: z.record(z.string(), z.string()).optional(),
  }),
) {}
