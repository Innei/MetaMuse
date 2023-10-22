import type { RouterOutputs } from '~/lib/trpc'

export type NoteModel = Omit<
  RouterOutputs['note']['id'],
  | '_count'
  | 'modified'
  | 'meta'
  | 'count'
  | 'created'
  | 'commentsIndex'
  | 'topic'
> & {
  meta?: any
  created?: string
}
