import type { RouterOutputs } from '~/lib/trpc'

export type NoteModel = Omit<
  RouterOutputs['note']['id'],
  '_count' | 'modified' | 'meta' | 'count' | 'created'
> & {
  meta?: any
  created?: string
}
