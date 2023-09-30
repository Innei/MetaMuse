import { Select, SelectItem } from '@nextui-org/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { produce } from 'immer'

import { RelativeTime } from '~/components/ui/date-time'
import { EllipsisHorizontalTextWithTooltip } from '~/components/ui/typography'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import {
  usePostModelDataSelector,
  usePostModelSetModelData,
} from '../data-provider'

export const RelatedPostSelector = () => {
  const { isLoading, isFetching, data, fetchNextPage } =
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
  const currentId = usePostModelDataSelector((state) => state?.id)
  const setter = usePostModelSetModelData()
  const selection = useMemo(() => {
    return new Set(relatedIds)
  }, [relatedIds])

  const scrollerRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const $scroller = scrollerRef.current
    if (!$scroller) return
    $scroller.onscrollend = () => {
      fetchNextPage()
    }

    return () => {
      $scroller.onscrollend = null
    }
  }, [fetchNextPage, isOpen])

  return (
    <Select
      label={t('module.posts.related_posts')}
      labelPlacement="outside"
      placeholder={t('module.posts.select_posts')}
      selectionMode="multiple"
      size="sm"
      scrollRef={scrollerRef}
      className="max-w-xs"
      isLoading={isLoading || isFetching}
      onOpenChange={setIsOpen}
      selectedKeys={selection}
      onSelectionChange={(keys) => {
        setter((state) => {
          return produce(state, (draft) => {
            draft.relatedIds = [...new Set<string>(keys as any).values()]
          })
        })
      }}
    >
      {/* // FIXME: https://github.com/nextui-org/nextui/issues/1715 */}
      {/* @ts-expect-error */}
      {data?.pages.map((page) => {
        return page.items.map((post) => {
          if (post.id === currentId) return
          return (
            <SelectItem id={post.id} key={post.id}>
              <div className="flex items-center">
                <EllipsisHorizontalTextWithTooltip className="flex-grow">
                  {post.title}
                </EllipsisHorizontalTextWithTooltip>
                <span className="flex-shrink-0 text-xs opacity-80">
                  <RelativeTime time={post.created} />
                </span>
              </div>
            </SelectItem>
          )
        })
      })}
    </Select>
  )
}
