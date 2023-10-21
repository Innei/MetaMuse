import { Chip, Tab, Tabs } from '@nextui-org/react'
import { createElement, useMemo } from 'react'
import type { FC } from 'react'

import { useIsMobile } from '~/atoms'
import {
  CommentDataContext,
  CommentDataSourceContext,
  CommentDesktopTable,
  CommentStateContext,
} from '~/components/modules/comments'
import { CommentMobileList } from '~/components/modules/comments/CommentMobileList'
import { CommentPagination } from '~/components/modules/comments/CommentPagation'
import { useRouterQueryState } from '~/hooks/biz/use-router-query-state'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import { CommentState } from '../../../components/modules/comments/constants'

export default function Page() {
  const t = useI18n()
  const TABS = useMemo(
    () => [
      {
        key: CommentState.UNREAD,
        title: t('module.comment.unread'),
        component: CommentTable,
        titleComponent: UnreadTabTitle,
      },

      {
        key: CommentState.READ,
        title: t('module.comment.read'),
        component: CommentTable,
      },

      {
        key: CommentState.SPAM,
        title: t('module.comment.spam'),
        component: CommentTable,
      },
    ],
    [t],
  )

  return (
    <>
      <div className="-mt-12 flex w-full flex-col flex-grow">
        <Tabs variant="underlined">
          {TABS.map(({ key, title, component: Component, titleComponent }) => (
            <Tab
              value={key}
              title={titleComponent ? createElement(titleComponent) : title}
              key={key}
              className="flex-grow flex flex-col"
            >
              <div className="h-0 flex flex-col overflow-auto flex-grow">
                <Component state={key} />
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  )
}

const UnreadTabTitle: FC = () => {
  const { data } = trpc.comment.unreadCount.useQuery()
  const t = useI18n()

  return (
    <span className="space-x-1 pb-1 inline-block">
      <span>{t('module.comment.unread')}</span>

      {data && (
        <Chip size="sm" color="primary" className="scale-80">
          {data}
        </Chip>
      )}
    </span>
  )
}

const CommentTable = (props: { state: CommentState }) => {
  const [page, setPage] = useRouterQueryState('page', 1)
  const { data, isLoading } = trpc.comment.list.useQuery(
    {
      state: props.state,
      page,
    },
    {
      keepPreviousData: true,
    },
  )

  const refModelMap = useMemo<
    Map<string, NormalizedPostModel | NormalizedNoteModel>
  >(() => {
    if (!data) return new Map()
    const map = new Map()
    data.data.forEach((item) => {
      map.set(item.id, item.ref)
    })
    return map
  }, [data])

  const relationCommentMap = useMemo(
    () => data?.relations.comments || ({} as any),
    [data?.relations.comments],
  )

  const isMobile = useIsMobile()
  return (
    <CommentStateContext.Provider value={props.state}>
      <CommentDataContext.Provider
        value={useMemo(
          () => ({
            refModelMap,
            relationCommentMap,
          }),
          [refModelMap, relationCommentMap],
        )}
      >
        <CommentDataSourceContext.Provider
          value={useMemo(
            () => ({
              isLoading,
              data: data?.data,
              setPage,
              pagination: data?.pagination,
            }),
            [data?.data, data?.pagination, isLoading, setPage],
          )}
        >
          <div className="flex flex-col flex-grow h-0 overflow-hidden">
            {isMobile ? <CommentMobileList /> : <CommentDesktopTable />}
            <CommentPagination />
          </div>
        </CommentDataSourceContext.Provider>
      </CommentDataContext.Provider>
    </CommentStateContext.Provider>
  )
}
