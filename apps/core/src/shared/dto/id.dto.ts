import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const SnowflakeIdSchema = z.string().regex(/^\d{18}$/)
export class SnowflakeIdDto extends createZodDto(
  z.object({
    id: SnowflakeIdSchema,
  }),
) {}
