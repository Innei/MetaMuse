import {
  Button,
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
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import useSWR from 'swr'

import { PaginationResult } from '@core/shared/interface/paginator.interface'

import { AddCircleLine } from '~/components/icons'
import { useBeforeMounted } from '~/hooks/use-before-mounted'
import { buildNSKey } from '~/lib/key'
import { $axios } from '~/lib/request'
import { PostModel } from '~/models/post'

enum ViewStyle {
  Table,
  List,
}

const viewStyleAtom = atomWithStorage(buildNSKey('view-style'), ViewStyle.Table)
const Header = () => {
  const [viewStyle, setViewStyle] = useAtom(viewStyleAtom)
  return (
    <div className="mb-6 flex h-12 justify-end space-x-2">
      <Button
        variant="light"
        isIconOnly
        onClick={() => {
          setViewStyle((prev) => {
            if (prev === ViewStyle.Table) {
              return ViewStyle.List
            }
            return ViewStyle.Table
          })
        }}
      >
        {viewStyle === ViewStyle.Table ? (
          <i className="icon-[mingcute--table-2-line]" />
        ) : (
          <i className="icon-[mingcute--menu-line]" />
        )}
      </Button>
      <Button variant="flat" color="primary">
        <AddCircleLine />
        新建
      </Button>
    </div>
  )
}
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
      return $axios.get<PaginationResult<PostModel>>('/admin/posts', {
        params: {
          page,
          size,
        },
      })
    },
    { keepPreviousData: true },
  )

  const currentSelectionRef = useRef<Set<string>>()
  return (
    <>
      <Header />
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
    </>
  )
}
function renderPostKeyValue(data: PostModel, key: any) {
  switch (key) {
    case 'category':
      return data.category?.name
    case 'count.read':
      return data.count?.read
    case 'count.like':
      return data.count?.like
    case 'tags':
      return data.tags.map((tag) => tag.name).join(',')

    case 'action': {
      return <Actions />
    }
  }
  return getKeyValue(data, key)
}

const Actions = () => {
  return (
    <div className="flex items-center space-x-2">
      <Button color="secondary" size="sm" variant="light">
        编辑
      </Button>
      <Button size="sm" variant="light" className="hover:text-red-500">
        删除
      </Button>
    </div>
  )
}
