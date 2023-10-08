import { BaseCrudFactory } from '@core/transformers/curd-factor.transformer'

import { TopicInputSchema } from './topic.dto'

export const TopicController = BaseCrudFactory({
  modelName: 'noteTopic',
  apiPrefix: 'topics',
  createSchema: TopicInputSchema,
  eventPrefix: 'TOPIC',
})
