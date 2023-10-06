import {
  Button,
  Chip,
  getKeyValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { atom, useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { PaginationResult } from '~/models/paginator'
import type { FC } from 'react'

import { ListSortAndFilterProvider } from '~/components/modules/writing/ListSortAndFilter'
import { ListTable } from '~/components/modules/writing/ListTable'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { useQueryPager, withQueryPager } from '~/hooks/biz/use-query-pager'
import { useI18n } from '~/i18n/hooks'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

import { RelativeTime } from '../../../../components/ui/date-time'

export default withQueryPager(function Page() {
  const [page, size] = useQueryPager()
  const sortingAtom = useMemo(
    () =>
      atom({ key: 'created', order: 'desc' } as {
        key: string
        order: 'asc' | 'desc'
      }),
    [],
  )

  const sorting = useAtomValue(sortingAtom)
  const filterAtom = useMemo(() => atom([] as string[]), [])

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

  const nav = useNavigate()
  const { mutateAsync: batchDelete } = trpc.post.batchDelete.useMutation()
  const utils = trpc.useContext()
  const t = useI18n()
  return (
    <ListSortAndFilterProvider
      sortingAtom={sortingAtom}
      filterAtom={filterAtom}
    >
      <ListTable
        onBatchDeleteClick={useEventCallback((ids) => {
          batchDelete({ ids }).then(() => {
            utils.post.invalidate()
            toast.success(t('common.delete-success'))
          })
        })}
        columns={[
          {
            key: 'title',
            label: '标题',
          },
          {
            key: 'category',
            label: '分类',
            render(data) {
              return data.category?.name
            },
          },
          {
            key: 'tags',
            label: '标签',
            render(data) {
              return data.tags.map((tag) => (
                <Chip
                  className="mr-1 text-xs"
                  size="sm"
                  color="primary"
                  variant="flat"
                  key={tag.id}
                >
                  {tag.name}
                </Chip>
              ))
            },
          },

          {
            key: 'count.read',
            label: <i className="icon-[mingcute--book-6-line]" />,
          },
          {
            key: 'count.like',
            label: <i className="icon-[mingcute--heart-line]" />,
          },
          {
            key: 'created',
            label: '创建时间',
            type: 'datetime',
          },
          {
            key: 'modified',
            label: '修改时间',
            type: 'datetime',
          },
          {
            key: 'action',
            label: '操作',
            className: 'w-1 text-center',
            render(data) {
              return <Actions data={data} />
            },
          },
        ]}
        onNewClick={useEventCallback(() => {
          nav(routeBuilder(Routes.PostEditOrNew, {}))
        })}
        renderCardBody={useEventCallback((item) => (
          <>
            <p>
              <span>
                位于分类：
                {item.category.name}
              </span>
            </p>
            <p>
              <span>标签：</span>
              {item.tags.map((tag) => tag.name).join(',')}
            </p>
            <p className="flex items-center text-foreground/80">
              <i className="icon-[mingcute--book-6-line]" />
              <span className="ml-1">{item.count.read}</span>
              <span className="w-5" />
              <i className="icon-[mingcute--heart-line] ml-2" />
              <span className="ml-1">{item.count.like}</span>
            </p>
            <p className="text-foreground/60">
              <RelativeTime time={item.created} />
            </p>
          </>
        ))}
        renderCardFooter={useEventCallback((item) => (
          <Actions data={item as any} />
        ))}
        data={
          data as PaginationResult<StringifyNestedDates<NormalizedPostModel>>
        }
        isLoading={isLoading}
      />
    </ListSortAndFilterProvider>
  )
})

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

    case 'title':
      return <TitleExtra data={data} />
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
        color="primary"
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
