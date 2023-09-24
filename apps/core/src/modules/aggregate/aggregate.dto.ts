import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { IConfig } from '../configs/configs.interface'

export class AggregateQueryDto extends createZodDto(
  z.object({
    theme: z.string().optional(),
  }),
) {}
export const infoQueryAllowedKeys = (() => {
  const keys = ['seo', 'url'] satisfies (keyof IConfig)[]
  return keys as ['seo', 'url']
})()

export class AggregateInfoQueryKeyDto extends createZodDto(
  z.object({
    key: z.enum(infoQueryAllowedKeys),
  }),
) {}
