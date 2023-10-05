import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  getKeyValue,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { toast } from 'sonner'
import type { FC } from 'react'

import { AddCircleLine } from '~/components/icons'
import {
  ListSortAndFilterProvider,
  SortAndFilterButton,
} from '~/components/modules/writing/ListSortAndFilter'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { MotionDivToBottom } from '~/components/ui/motion'
import { useQueryPager } from '~/hooks/biz/use-query-pager'
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
        <SortAndFilterButton />

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
  const [page, size, setPage] = useQueryPager()
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
  const currentSelectionRef = useRef<Set<string>>()
  const viewStyle = useAtomValue(viewStyleAtom)

  return (
    <ListSortAndFilterProvider
      sortingAtom={sortingAtom}
      filterAtom={filterAtom}
    >
      <Header />

      {ViewStyle.Table === viewStyle ? (
        <Table
          className="min-h-[32.8rem] overflow-auto bg-transparent [&_table]:min-w-[1000px]"
          removeWrapper
          selectionMode="multiple"
          onSelectionChange={(e) => {
            currentSelectionRef.current = new Set(e as Set<string>)
          }}
          defaultSelectedKeys={currentSelectionRef.current}
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
      ) : (
        <div className="min-h-[32.8rem] grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 4k:grid-cols-8 gap-4 mb-8">
          {data?.data.map((item) => {
            if (!item) return null
            return (
              <Card
                as={MotionDivToBottom}
                shadow="sm"
                className="ring-1 ring-zinc-200/60 dark:ring-neutral-800/70"
                key={item.id}
              >
                <CardHeader className="flex gap-2">
                  <Checkbox
                    size="sm"
                    defaultSelected={
                      currentSelectionRef.current?.has(item.id) ?? false
                    }
                    onValueChange={(value) => {
                      if (currentSelectionRef.current) {
                        if (value) {
                          currentSelectionRef.current.add(item.id)
                        } else {
                          currentSelectionRef.current.delete(item.id)
                        }
                      }
                    }}
                  />
                  <TitleExtra data={item} />
                </CardHeader>
                <Divider />
                <CardBody className="text-small flex flex-col gap-2">
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
                </CardBody>
                <CardFooter className="flex justify-end">
                  <Actions data={item as any} />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
      {!!data && data.pagination.totalPage > 1 && (
        <motion.div
          layout="position"
          className="mt-8 flex w-full items-center justify-end gap-4"
        >
          <Pagination
            total={data?.pagination.totalPage}
            initialPage={page}
            variant="light"
            onChange={setPage}
          />
        </motion.div>
      )}
    </ListSortAndFilterProvider>
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
