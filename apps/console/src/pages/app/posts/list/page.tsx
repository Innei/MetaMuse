import {
  Button,
  getKeyValue,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import { FC, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { PaginationResult } from '@core/shared/interface/paginator.interface'

import { AddCircleLine, FilterLineIcon } from '~/components/icons'
import { RelativeTime } from '~/components/ui/DateTime'
import { useBeforeMounted } from '~/hooks/use-before-mounted'
import { buildNSKey } from '~/lib/key'
import { $axios } from '~/lib/request'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { PostModel } from '~/models/post'
import { router } from '~/router'

enum ViewStyle {
  Table,
  List,
}

const viewStyleAtom = atomWithStorage(buildNSKey('view-style'), ViewStyle.Table)
const filterAtom = atom([] as string[])
const sortingAtom = atom({ key: 'created', order: 'desc' } as {
  key: string
  order: 'asc' | 'desc'
})

const Filter = () => {
  return null
  // TODO
  return (
    <div className="w-full px-1 py-2">
      <p className="text-small text-foreground font-bold"></p>
      <div className="mt-2 flex w-full flex-col gap-2"></div>
    </div>
  )
}

const sortingKeyMap = {
  created: '创建时间',
  modified: '修改时间',
}

const sortingOrderList = [
  {
    key: 'asc',
    label: '升序',
  },
  {
    key: 'desc',
    label: '降序',
  },
]

const Sorting = () => {
  const [sorting, setSorting] = useAtom(sortingAtom)
  const sortingKey = useMemo(() => new Set([sorting.key]), [sorting.key])
  const sortingOrder = useMemo(() => new Set([sorting.order]), [sorting.order])
  // TODO
  return (
    <div className="w-full space-y-2 px-2 py-3">
      <Select
        size="sm"
        label="按照以下字段排序"
        selectedKeys={sortingKey}
        onSelectionChange={(value) => {
          if (typeof value === 'string') return
          setSorting((prev) => ({
            ...prev,
            key: value.keys()[0],
          }))
        }}
      >
        {Object.entries(sortingKeyMap).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </Select>

      <Select
        size="sm"
        label="排序方式"
        onSelectionChange={(value) => {
          if (typeof value === 'string') return
          setSorting((prev) => ({
            ...prev,
            order: value.keys()[0],
          }))
        }}
        selectedKeys={sortingOrder}
        className="w-full"
      >
        {sortingOrderList.map(({ key, label }) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

const Header = () => {
  const [viewStyle, setViewStyle] = useAtom(viewStyleAtom)
  return (
    <div className="mb-6 flex h-12 justify-between space-x-2">
      <Button
        variant="flat"
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

      <div className="space-x-2">
        <Popover
          classNames={{
            base: 'p-0',
          }}
        >
          <PopoverTrigger>
            <Button isIconOnly variant="flat">
              <FilterLineIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="w-52">
              <Filter />
              <Sorting />
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="flat" color="primary">
          <AddCircleLine />
          新建
        </Button>
      </div>
    </div>
  )
}

export default () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [search, setSearch] = useSearchParams()

  useBeforeMounted(() => {
    if (!search.get('page')) setSearch((p) => ({ ...p, page: 1 }))
    if (!search.get('size')) setSearch((p) => ({ ...p, size: 10 }))
    try {
      search.forEach((value, key) => {
        if (key === 'page') {
          setPage(Number(value))
        }
        if (key === 'size') {
          setSize(Number(value))
        }
      })
    } catch {}
  })

  const { data, isLoading } = useQuery(
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

  const currentPage = useMemo(
    () => parseInt(search.get('page')!) || 1,
    [search],
  )
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
          <TableColumn className="text-center" width={1} key={'action'}>
            操作
          </TableColumn>
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

      {!!data && data.pagination.totalPage > 1 && (
        <div className="mt-8 flex w-full items-center justify-end gap-4">
          <Pagination
            total={data?.pagination.totalPage}
            initialPage={currentPage}
            variant={'light'}
            onChange={(page) => {
              setPage(page)
              setSearch((p) => ({ ...p, page }))
            }}
          />
        </div>
      )}
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

    case 'created':
    case 'modified':
      return <RelativeTime time={data[key]} />

    case 'action': {
      return <Actions data={data} />
    }
  }
  return getKeyValue(data, key)
}

const Actions: FC<{ data: PostModel }> = ({ data }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => {
          router.navigate(
            routeBuilder(Routes.PostEditOrNew, {
              id: data.id,
            }),
          )
        }}
        color="secondary"
        size="sm"
        variant="light"
      >
        编辑
      </Button>
      <Button size="sm" variant="light" className="hover:text-red-500">
        删除
      </Button>
    </div>
  )
}
