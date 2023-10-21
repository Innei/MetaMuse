import {
  Link,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { omit } from 'lodash-es'

import { useCommentDataSource } from '~/components/modules/comments/CommentContext'
import { useI18n } from '~/i18n/hooks'

import { CommentAuthorCell } from './CommentAuthorCell'
import { CommentContentCell } from './CommentContentCell'

export const CommentDesktopTable = () => {
  const t = useI18n()
  const { isLoading, data } = useCommentDataSource()
  return (
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
        items={data || []}
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
    <Link size="sm" href={url}>
      {author}
    </Link>
  ) : (
    <span>{author}</span>
  )
}
