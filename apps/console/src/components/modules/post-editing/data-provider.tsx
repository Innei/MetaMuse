import { createModelDataProvider } from 'jojoo/react'
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

export const {
  useModelDataSelector: usePostModelDataSelector,
  useSetModelData: usePostModelSetModelData,
  useGetModelData: usePostModelGetModelData,

  ModelDataAtomProvider: PostModelDataAtomProvider,
} = createModelDataProvider<PostModel>()
