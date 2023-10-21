import { createContext, useContext } from 'react'
import { createContextState } from 'foxact/create-context-state'
import type { Comment } from '@model'
import type { CommentState } from '~/components/modules/comments/constants'
import type { Paginator } from '~/models/paginator'

export const CommentStateContext = createContext<CommentState>(null!)
export const CommentDataSourceContext = createContext<{
  isLoading: boolean
  data?: NormalizedComment[]
  pagination?: Paginator

  setPage: (page: number) => void
}>(null!)
export const CommentDataContext = createContext<{
  refModelMap: Map<string, NormalizedPostModel | NormalizedNoteModel>
  relationCommentMap: Record<string, Comment>
}>(null!)
export const useCommentDataSource = () => useContext(CommentDataSourceContext)

export const [
  CommentSelectionKeysProvider,
  useCommentSelectionKeys,
  useSetCommentSelectionKeys,
] = createContextState(new Set<string>())
