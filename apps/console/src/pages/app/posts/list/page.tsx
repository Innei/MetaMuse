import { Button, Chip } from '@nextui-org/react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { atom, useAtomValue } from 'jotai'
import RemoveMarkdown from 'remove-markdown'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { PaginationResult } from '~/models/paginator'
import type { FC } from 'react'

import { DeleteConfirmButton } from '~/components/biz/special-button/DeleteConfirmButton'
import { ListSortAndFilterProvider } from '~/components/modules/writing/ListSortAndFilter'
import { ListTable } from '~/components/modules/writing/ListTable'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { useQueryPager, withQueryPager } from '~/hooks/biz/use-query-pager'
import { useI18n } from '~/i18n/hooks'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

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
  const utils = trpc.useUtils()
  const t = useI18n()
  const renderCardBody = useCallback(
    (item: StringifyNestedDates<NormalizedPostModel>) => (
      <>
        <p>
          <span>
            位于分类：
            {item.category.name}
          </span>
        </p>
        {item.tags.length ? (
          <p>
            <span>标签：</span>
            {item.tags.map((tag) => tag.name).join(',')}
          </p>
        ) : null}

        <p>{item.summary || RemoveMarkdown(item.text)}</p>
        <p className="flex items-center text-foreground/80">
          <i className="icon-[mingcute--book-6-line]" />
          <span className="ml-1">{item.count.read}</span>
          <span className="w-5" />
          <i className="icon-[mingcute--heart-line] ml-2" />
          <span className="ml-1">{item.count.like}</span>
        </p>
      </>
    ),
    [],
  )
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
            render(data) {
              return <TitleExtra data={data} />
            },
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
            type: 'number',
          },
          {
            key: 'count.like',
            type: 'number',
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
        renderCardBody={renderCardBody}
        renderCardFooter={useCallback(
          (item: StringifyNestedDates<NormalizedPostModel>) => (
            <Actions data={item as any} />
          ),
          [],
        )}
        data={
          data as PaginationResult<StringifyNestedDates<NormalizedPostModel>>
        }
        isLoading={isLoading}
      />
    </ListSortAndFilterProvider>
  )
})

const Actions: FC<{ data: StringifyNestedDates<NormalizedPostModel> }> = ({
  data,
}) => {
  const { mutateAsync: deleteById } = trpc.post.delete.useMutation()
  const utils = trpc.useUtils()
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
        {t('common.edit')}
      </Button>
      <DeleteConfirmButton
        deleteItemText={data.title}
        onDelete={() =>
          deleteById({
            id: data.id,
          }).then(() => {
            utils.post.invalidate()
          })
        }
      />
    </div>
  )
}
