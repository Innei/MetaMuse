import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { NoteTopicOptionalDefaultsSchema } from '@meta-muse/prisma/zod'

export const TopicInputSchema = NoteTopicOptionalDefaultsSchema.extend({
  icon: z.string().url().nullable(),
  description: z.string().max(255).optional(),
  introduce: z.string().max(1024).optional(),
  name: z.string().max(64),
  slug: z.string().max(128),
})

export class TopicDto extends createZodDto(TopicInputSchema) {}
