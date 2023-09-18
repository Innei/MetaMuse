import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useSWR from 'swr'

import { PaginationResult } from '@core/shared/interface/paginator.interface'

import { useBeforeMounted } from '~/hooks/use-before-mounted'
import { useI18n } from '~/i18n/hooks'
import { $axios } from '~/lib/request'
import { PostWithCategory } from '~/models/post'

export default () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const { search } = useLocation()

  useBeforeMounted(() => {
    try {
      new URLSearchParams(search).forEach((value, key) => {
        if (key === 'page') {
          setPage(Number(value))
        }
        if (key === 'size') {
          setSize(Number(value))
        }
      })
    } catch {}
  })

  const { data, isLoading } = useSWR(
    ['/posts', page, size],
    async () => {
      return $axios.get<PaginationResult<PostWithCategory>>('/admin/posts', {
        params: {
          page,
          size,
        },
      })
    },
    { keepPreviousData: true },
  )

  const t = useI18n()
  const currentSelectionRef = useRef<Set<string>>()
  return (
    <Table
      className="bg-transparent"
      removeWrapper
      selectionMode="multiple"
      onSelectionChange={(e) => {
        currentSelectionRef.current = new Set(e as Set<string>)
      }}
    >
      <TableHeader>
        <TableColumn key={'title'}>标题</TableColumn>
        <TableColumn key={'category'}>分类</TableColumn>
        <TableColumn key={'tags'}>标签</TableColumn>
        <TableColumn key={'count.read'}>
          <i className="icon-[mingcute--book-6-line]" />
        </TableColumn>
        <TableColumn key={'count.like'}>
          <i className="icon-[mingcute--heart-line]" />
        </TableColumn>
        <TableColumn key={'created'}>创建时间</TableColumn>
        <TableColumn key={'modified'}>修改时间</TableColumn>
        <TableColumn key={'action'}>操作</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        emptyContent={'这里空空如也'}
        items={data?.data || []}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderPostKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
function renderPostKeyValue(data: PostWithCategory, key: any) {
  switch (key) {
    case 'category':
      return data.category?.name
    case 'count.read':
      return data.count?.read
    case 'count.like':
      return data.count?.like
    //   case 'tags' :
    // return data.category
  }
  return getKeyValue(data, key)
}
