import { trpc } from '~/lib/trpc'

export const RelatedPostSelector = () => {
  const { isLoading, data } = trpc.post.relatedList.useInfiniteQuery(
    {
      size: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )
  return null
}
