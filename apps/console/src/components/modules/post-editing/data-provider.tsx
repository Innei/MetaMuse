import { createModelDataProvider } from 'jojoo/react'
import type { PostModel } from '~/models/post'

export const {
  useModelDataSelector: usePostModelDataSelector,
  useSetModelData: usePostModelSetModelData,
  useGetModelData: usePostModelGetModelData,

  ModelDataAtomProvider: PostModelDataAtomProvider,
} = createModelDataProvider<PostModel>()
