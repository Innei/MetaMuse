import {
  Avatar,
  Chip,
  Link,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from '@nextui-org/react'
import { createContext, createElement, useContext, useMemo } from 'react'
import { omit } from 'lodash-es'
import type { Comment } from '@model'
import type { FC } from 'react'
import type { NormalizedComment } from './types'

import { IpInfoPopover } from '~/components/biz/ip/IpInfoPopover'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { RelativeTime } from '~/components/ui/date-time'
import { useRouterQueryState } from '~/hooks/biz/use-router-query-state'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import { CommentState } from './constants'

const CommentStateContext = createContext<CommentState>(null!)

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
              <div className="h-0 overflow-auto flex-grow">
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

const CommentDataContext = createContext<{
  refModelMap: Map<string, NormalizedPostModel | NormalizedNoteModel>
  relationCommentMap: Record<string, Comment>
}>(null!)

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

  const t = useI18n()

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
        <Table
          removeWrapper
          isHeaderSticky
          selectionMode="multiple"
          className="mt-8 [&_tr:first-child_td]:border-t-[1rem] [&_tr:first-child_td]:border-t-transparent"
        >
          <TableHeader>
            <TableColumn key="author">{t('common.author')}</TableColumn>
            <TableColumn key="content">{t('common.content')}</TableColumn>
          </TableHeader>
          <TableBody
            loadingContent={<Spinner />}
            loadingState={isLoading ? 'loading' : 'idle'}
            isLoading={isLoading}
            items={data?.data || []}
          >
            {(item) => {
              const itemOmitRef = omit(item, 'ref') as NormalizedComment
              return (
                <TableRow key={item.id}>
                  <TableCell width={400}>
                    <AuthorCell {...itemOmitRef} />
                  </TableCell>
                  <TableCell className="align-top" width={2000} key="content">
                    <ContentCell {...itemOmitRef} />
                  </TableCell>
                </TableRow>
              )
            }}
          </TableBody>
        </Table>
      </CommentDataContext.Provider>
    </CommentStateContext.Provider>
  )
}

const UrlRender = ({ url, author }: { url: string | null; author: string }) => {
  return url ? (
    <Link size="sm" href={url}>
      {author}
    </Link>
  ) : (
    <span>{author}</span>
  )
}

const AuthorCell = (props: NormalizedComment) => {
  const { author, avatar, url, mail, ip } = props
  return (
    <div className="flex space-x-8">
      <div>
        <Avatar size="md" src={avatar || ''} name={author[0]} />
      </div>
      <div className="flex text-sm flex-col gap-1">
        <UrlRender url={url} author={author} />

        <Link
          size="sm"
          className="text-xs"
          color="secondary"
          href={`mailto:${mail}`}
        >
          {mail}
        </Link>

        {ip && <IpInfoPopover className="text-foreground/60 text-xs" ip={ip} />}
      </div>
    </div>
  )
}

export const ContentCell = (props: NormalizedComment) => {
  const { created, refType, text, id, parent: rootComment, mentions } = props
  const ctx = useContext(CommentDataContext)
  const ref = ctx.refModelMap.get(id)
  const parentComment = ctx.relationCommentMap[mentions[0]]

  const TitleEl = useMemo(() => {
    if (!ref) return <span className="text-foreground/60">已删除</span>
    if (refType === 'Recently') return `${ref.text.slice(0, 20)}...`
    return <TitleExtra className="text-primary" data={ref} />
  }, [ref, refType])
  return (
    <div className="flex flex-col gap-2 py-2 text-sm">
      <div className="flex gap-2 text-xs">
        <RelativeTime time={created} /> 于 {TitleEl}
      </div>

      <p>{text}</p>

      <div className="relative">
        {parentComment && (
          <blockquote className="ml-3 before:content-[''] before:absolute before:left-[3px] before:rounded-lg before:top-0 before:bottom-0 before:bg-primary before:w-[3px] before:h-full pl-3">
            <div>
              <UrlRender
                author={parentComment.author}
                url={parentComment.url}
              />{' '}
              在 <RelativeTime time={parentComment.created} /> 说:
            </div>
            <p className="mt-2">{parentComment.text}</p>
          </blockquote>
        )}
      </div>

      <CommentAction id={id} />
    </div>
  )
}

const CommentAction = (props: { id: string }) => {
  const currentState = useContext(CommentStateContext)

  return null
}
