import { Chip, Tab, Tabs } from '@nextui-org/react'
import { createElement, useMemo } from 'react'
import type { FC } from 'react'

import { useRouterQueryState } from '~/hooks/biz/use-router-query-state'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import { CommentState } from './constants'

export default function Page() {
  const t = useI18n()
  const TABS = useMemo(
    () => [
      {
        key: CommentState.UNREAD,
        title: t('module.comment.unread'),
        component: UnreadTable,
        titleComponent: UnreadTabTitle,
      },

      {
        key: CommentState.READ,
        title: t('module.comment.read'),
        component: UnreadTable,
      },

      {
        key: CommentState.SPAM,
        title: t('module.comment.spam'),
        component: UnreadTable,
      },
    ],
    [t],
  )

  return (
    <>
      <div className="-mt-12 flex w-full flex-col">
        <Tabs variant="underlined">
          {TABS.map(({ key, title, component: Component, titleComponent }) => (
            <Tab
              value={key}
              title={titleComponent ? createElement(titleComponent) : title}
              key={key}
            >
              <Component state={key} />
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
    <span className="space-x-2">
      <span>{t('module.comment.unread')}</span>

      {data && (
        <Chip size="sm" color="primary">
          {data}
        </Chip>
      )}
    </span>
  )
}

const UnreadTable = (props: { state: CommentState }) => {
  const [page, setPage] = useRouterQueryState('page', 1)
  const { data } = trpc.comment.list.useQuery({
    state: props.state,
    page,
  })

  return null
}
