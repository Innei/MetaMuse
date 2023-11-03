import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { omit } from 'lodash-es'

import { Empty } from '~/components/common/Empty'
import {
  useCommentDataSource,
  useCommentSelectionKeys,
  useSetCommentSelectionKeys,
} from '~/components/modules/comments/CommentContext'
import { Spinner } from '~/components/ui/spinner'
import { useI18n } from '~/i18n/hooks'

import { CommentAuthorCell } from './CommentAuthorCell'
import { CommentContentCell } from './CommentContentCell'

export const CommentDesktopTable = () => {
  const t = useI18n()
  const { data, isLoading } = useCommentDataSource()

  const selectionKeys = useCommentSelectionKeys()
  const setSelectionKeys = useSetCommentSelectionKeys()
  return (
    // <ScrollArea.ScrollArea rootClassName="mt-4 flex-shrink h-0 flex-grow">
    <div className="flex-shrink h-0 flex-grow overflow-auto flex flex-col relative">
      {isLoading && (
        <Spinner className="absolute z-[10] inset-0 flex items-center justify-center" />
      )}
      <Table
        selectedKeys={selectionKeys}
        onSelectionChange={(key) => {
          if (key === 'all') {
            setSelectionKeys(new Set(data?.map((item) => item.id)))
            return
          }
          setSelectionKeys(key as Set<string>)
        }}
        removeWrapper
        isHeaderSticky
        selectionMode="multiple"
        className="mt-4 [&_tr:first-child_td]:border-t-[1rem] [&_tr:first-child_td]:border-t-transparent flex-grow"
      >
        <TableHeader>
          <TableColumn key="author">{t('common.author')}</TableColumn>
          <TableColumn key="content">{t('common.content')}</TableColumn>
        </TableHeader>
        <TableBody
          className={isLoading ? 'opacity-80 pointer-events-none' : ''}
          items={data || []}
          emptyContent={<Empty />}
        >
          {(item) => {
            const itemOmitRef = omit(item, 'ref') as NormalizedComment
            return (
              <TableRow key={item.id}>
                <TableCell width={400}>
                  <CommentAuthorCell {...itemOmitRef} />
                </TableCell>
                <TableCell className="align-top" width={2000} key="content">
                  <CommentContentCell {...itemOmitRef} />
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
    </div>

    // </ScrollArea.ScrollArea>
  )
}

export const UrlRender = ({
  url,
  author,
}: {
  url: string | null
  author: string
}) => {
  return url ? (
    <a className="text-sm text-primary" href={url}>
      {author}
    </a>
  ) : (
    <span>{author}</span>
  )
}
