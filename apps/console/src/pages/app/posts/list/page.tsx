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
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { produce } from 'immer'
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { toast } from 'sonner'
import type { FC } from 'react'

import { AddCircleLine, FilterLineIcon } from '~/components/icons'
import { useBeforeMounted } from '~/hooks/use-before-mounted'
import { useI18n } from '~/i18n/hooks'
import { buildNSKey } from '~/lib/key'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

import { RelativeTime } from '../../../../components/ui/date-time'

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
      <p className="text-small text-foreground font-bold" />
      <div className="mt-2 flex w-full flex-col gap-2" />
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
          setSorting((prev) => {
            return produce(prev, (draft) => {
              // @ts-expect-error
              draft.key = value.currentKey
            })
          })
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
          setSorting((prev) => {
            return produce(prev, (draft) => {
              // @ts-expect-error
              draft.order = value.currentKey
            })
          })
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

  const sorting = useAtomValue(sortingAtom)
  const isHasSorting = useMemo(() => {
    return (
      sorting.key &&
      sorting.order &&
      !(sorting.key === 'created' && sorting.order === 'desc')
    )
  }, [sorting])

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
            <Button
              isIconOnly
              variant={isHasSorting ? 'solid' : 'flat'}
              color={isHasSorting ? 'primary' : 'default'}
            >
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

        <Button
          onClick={() => {
            router.navigate(routeBuilder(Routes.PostEditOrNew, {}))
          }}
          variant="flat"
          color="primary"
        >
          <AddCircleLine />
          新建
        </Button>
      </div>
    </div>
  )
}

export default function Page() {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [search, setSearch] = useSearchParams()

  const sorting = useAtomValue(sortingAtom)

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

  const { data, isLoading } = trpc.post.paginate.useQuery(
    {
      page,
      size,
      sortBy: sorting.key as any,
      sortOrder: sorting.order,
    },
    {
      keepPreviousData: true,
      refetchOnMount: true,
    },
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
        className="min-h-[32.8rem] overflow-auto bg-transparent [&_table]:min-w-[1000px]"
        removeWrapper
        selectionMode="multiple"
        onSelectionChange={(e) => {
          currentSelectionRef.current = new Set(e as Set<string>)
        }}
      >
        <TableHeader>
          <TableColumn key="title">标题</TableColumn>
          <TableColumn key="category">分类</TableColumn>
          <TableColumn key="tags">标签</TableColumn>
          <TableColumn key="count.read">
            <i className="icon-[mingcute--book-6-line]" />
          </TableColumn>
          <TableColumn key="count.like">
            <i className="icon-[mingcute--heart-line]" />
          </TableColumn>
          <TableColumn key="created">创建时间</TableColumn>
          <TableColumn key="modified">修改时间</TableColumn>
          <TableColumn className="text-center" width={1} key="action">
            操作
          </TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          emptyContent="这里空空如也"
          items={data?.data || []}
        >
          {(item) => (
            <TableRow key={item!.id}>
              {(columnKey) => (
                <TableCell>
                  {renderPostKeyValue(item! as any, columnKey)}
                </TableCell>
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
            variant="light"
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

function renderPostKeyValue(
  data: StringifyNestedDates<NormalizedPostModel>,
  key: any,
) {
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
      if (!data[key]) return '-'
      return <RelativeTime time={data[key]} />

    case 'action': {
      return <Actions data={data} />
    }
  }
  return getKeyValue(data, key)
}

const Actions: FC<{ data: StringifyNestedDates<NormalizedPostModel> }> = ({
  data,
}) => {
  const { mutateAsync: deleteById } = trpc.post.delete.useMutation()
  const utils = trpc.useContext()
  const t = useI18n()
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
      <Popover>
        <PopoverTrigger>
          <Button size="sm" variant="light" className="hover:text-red-500">
            删除
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-4">
            <p className="text-center text-red-500 text-base font-bold">
              {t('common.confirm-delete')}
            </p>
          </div>
          <div>
            <Button
              size="sm"
              variant="light"
              color="danger"
              onClick={() => {
                deleteById({
                  id: data.id,
                }).then(() => {
                  utils.post.invalidate()

                  toast.success(t('common.delete-success'))
                })
              }}
            >
              {t('common.sure')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
