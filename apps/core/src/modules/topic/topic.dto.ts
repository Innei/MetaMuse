import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { NoteTopicOptionalDefaultsSchema } from '@meta-muse/prisma/zod'

export const TopicInputSchema = NoteTopicOptionalDefaultsSchema.extend({
  icon: z.string().url().nullable(),
})

export class TopicDto extends createZodDto(TopicInputSchema) {}
