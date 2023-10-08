import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { atom, useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { PaginationResult } from '~/models/paginator'
import type { FC } from 'react'

import { ListSortAndFilterProvider } from '~/components/modules/writing/ListSortAndFilter'
import { ListTable } from '~/components/modules/writing/ListTable'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { FloatPopover } from '~/components/ui/float-popover'
import { EllipsisHorizontalTextWithTooltip } from '~/components/ui/typography'
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

  const { data, isLoading } = trpc.note.paginate.useQuery(
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
  const { mutateAsync: batchDelete } = trpc.note.batchDelete.useMutation()
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
            utils.note.invalidate()
            toast.success(t('common.delete-success'))
          })
        })}
        columns={[
          {
            key: 'title',
            label: '标题',
            render(data) {
              return <TitleExtra data={data} />
            },
          },
          {
            key: 'mood',
            label: '心情',
            width: 100,
          },
          {
            key: 'weather',
            label: '天气',
            width: 100,
          },

          {
            key: 'location',
            width: 200,
            label: '地点',
            render(data) {
              const { coordinates, location } = data
              if (!location) return null

              return (
                <FloatPopover
                  TriggerComponent={() => {
                    return (
                      <EllipsisHorizontalTextWithTooltip className="max-w-[200px]">
                        {location}
                      </EllipsisHorizontalTextWithTooltip>
                    )
                  }}
                >
                  <p>{location}</p>
                  <p>
                    {coordinates?.longitude}, {coordinates?.latitude}
                  </p>
                </FloatPopover>
              )
            },
          },
          {
            key: 'count.read',
            label: <i className="icon-[mingcute--book-6-line]" />,
            type: 'number',
          },
          {
            key: 'count.like',
            label: <i className="icon-[mingcute--heart-line]" />,
            type: 'number',
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
          nav(routeBuilder(Routes.NoteEditOrNew, {}))
        })}
        renderCardBody={useCallback(
          (item: StringifyNestedDates<NormalizedNoteModel>) => (
            <>
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
          ),
          [],
        )}
        renderCardFooter={useCallback(
          (item: StringifyNestedDates<NormalizedNoteModel>) => (
            <Actions data={item as any} />
          ),
          [],
        )}
        data={
          data as any as PaginationResult<
            StringifyNestedDates<NormalizedNoteModel>
          >
        }
        isLoading={isLoading}
      />
    </ListSortAndFilterProvider>
  )
})

const Actions: FC<{ data: StringifyNestedDates<NormalizedNoteModel> }> = ({
  data,
}) => {
  const { mutateAsync: deleteById } = trpc.note.delete.useMutation()
  const utils = trpc.useContext()
  const t = useI18n()
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => {
          router.navigate(
            routeBuilder(Routes.NoteEditOrNew, {
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
                  utils.note.invalidate()

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
