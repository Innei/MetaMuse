import { Select, SelectItem } from '@nextui-org/react'
import { useMemo } from 'react'
import { produce } from 'immer'

import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll'

import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import {
  usePostModelDataSelector,
  usePostModelSetModelData,
} from '../data-provider'

export const RelatedPostSelector = () => {
  const { isLoading, data, fetchNextPage } =
    trpc.post.relatedList.useInfiniteQuery(
      {
        size: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    )
  const t = useI18n()
  const relatedIds = usePostModelDataSelector((state) => state?.relatedIds)
  const setter = usePostModelSetModelData()
  const selection = useMemo(() => {
    return new Set(relatedIds)
  }, [relatedIds])
  const [, scrollerRef] = useInfiniteScroll({
    hasMore: data?.pages[data.pages.length - 1].nextCursor != null,
    isEnabled: !!data,
    shouldUseLoader: false, // We don't want to show the loader at the bottom of the list
    onLoadMore: fetchNextPage,
  })
  return (
    <Select
      label={t('module.posts.related_posts')}
      labelPlacement="outside"
      placeholder={t('module.posts.select_posts')}
      selectionMode="multiple"
      size="sm"
      scrollRef={scrollerRef}
      className="max-w-xs"
      isLoading={isLoading}
      selectedKeys={selection}
      onSelectionChange={(keys) => {
        setter((state) => {
          return produce(state, (draft) => {
            draft.relatedIds = [...new Set<string>(keys as any).values()]
          })
        })
      }}
    >
      {
        data?.pages.map((page) => {
          return page.items.map((post) => {
            return (
              <SelectItem id={post.id} key={post.id}>
                {post.title}
              </SelectItem>
            )
          })
          // FIXME: https://github.com/nextui-org/nextui/issues/1715
        }) as any
      }
    </Select>
  )
}
