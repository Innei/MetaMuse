import { Pagination } from '@nextui-org/react'

import { useCommentDataSource } from './CommentContext'

export const CommentPagination = () => {
  const { setPage, pagination } = useCommentDataSource()

  const page = pagination?.currentPage || 1

  if (!pagination) return null
  return (
    <div className="flex-shrink-0 text-right w-[calc(100%-1rem)] mt-2">
      <Pagination
        showControls
        className="inline-block"
        total={pagination.totalPage}
        initialPage={page}
        variant="light"
        onChange={setPage}
      />
    </div>
  )
}
