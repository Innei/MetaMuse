import type { RouterOutputs } from '~/lib/trpc'

export type PostModel = Omit<
  RouterOutputs['post']['id'],
  | '_count'
  | 'category'
  | 'modified'
  | 'relatedBy'
  | 'meta'
  | 'count'
  | 'created'
> & {
  meta?: any
  created?: string
}
