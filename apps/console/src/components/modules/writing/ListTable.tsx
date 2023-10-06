import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { createContext, useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEventCallback } from 'usehooks-ts'
import type { TableColumnProps } from '@nextui-org/react'
import type { PaginationResult } from '~/models/paginator'
import type { FC, PropsWithChildren, ReactNode } from 'react'

import { useIsMobile } from '~/atoms'
import { AddCircleLine } from '~/components/icons'
import { MotionDivToBottom } from '~/components/ui/motion'
import { useQueryPager } from '~/hooks/biz/use-query-pager'
import { useI18n } from '~/i18n/hooks'
import { buildNSKey } from '~/lib/key'
import { useModalStack } from '~/providers/modal-stack-provider'

import { SortAndFilterButton } from './ListSortAndFilter'
import { TitleExtra } from './TitleExtra'

enum ViewStyle {
  Table,
  List,
}

const createDefaultCtxValue = () => {
  return {
    viewStyleAtom: atomWithStorage(buildNSKey('view-style'), ViewStyle.Table),

    selectionAtom: atom(new Set<string>()),
  }
}

const ListTableContext = createContext<ListTableContextValue>(null!)

type ListTableContextValue = ReturnType<typeof createDefaultCtxValue>

type HeaderProps = {
  onNewClick: () => void
  onBatchDeleteClick: (ids: string[]) => void
}

const Header: FC<HeaderProps> = ({ onNewClick, onBatchDeleteClick }) => {
  const { viewStyleAtom, selectionAtom } = useContext(ListTableContext)
  const [viewStyle, setViewStyle] = useAtom(viewStyleAtom)
  const [selection, setSelection] = useAtom(selectionAtom)

  const { present } = useModalStack()
  const hasSelection = selection.size > 0
  const t = useI18n()
  const actionButtonClick = useEventCallback(() => {
    if (hasSelection) {
      present({
        title: t('common.confirm-delete'),
        content: ({ dismiss }) => (
          <div className="flex flex-col w-full">
            <span>
              {t('common.delete')} {selection.size} {t('common.items')}?
            </span>
            <div className="flex w-full justify-end">
              <Button
                variant="light"
                color="danger"
                onClick={() => {
                  onBatchDeleteClick(Array.from(selection))
                  setSelection(new Set())
                  dismiss()
                }}
              >
                {t('common.sure')}
              </Button>
            </div>
          </div>
        ),
      })
    } else {
      onNewClick()
    }
  })
  const isMobile = useIsMobile()
  return (
    <div className="mb-6 flex h-12 justify-between space-x-2">
      {!isMobile ? (
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
      ) : (
        <b />
      )}

      <div className="space-x-2">
        <SortAndFilterButton />

        <Button
          onClick={actionButtonClick}
          variant="flat"
          color={hasSelection ? 'danger' : 'primary'}
        >
          {hasSelection ? (
            <i className="icon-[mingcute--delete-2-line]" />
          ) : (
            <AddCircleLine />
          )}
          {hasSelection ? t('common.delete') : t('common.new')}
        </Button>
      </div>
    </div>
  )
}

type DataBaseType = {
  id: string
  title: string
  isPublished?: boolean
}

type ListTableWrapperProps<
  T extends PaginationResult<Data>,
  Data extends DataBaseType,
  Col extends ListColumn<Data> = ListColumn<Data>,
  Cols extends Col[] = Col[],
> = PropsWithChildren<{
  data?: T | null
  isLoading?: boolean
  renderTableRowKeyValue: (
    data: Data,
    key: Cols[number]['key'],
  ) => React.ReactNode
}> &
  Pick<TableRenderProps<Data, Col, Cols>, 'columns'> &
  Pick<CardsRenderProps<Data>, 'renderCardBody' | 'renderCardFooter'> &
  HeaderProps

export const ListTable = <
  Data extends DataBaseType,
  T extends PaginationResult<Data>,
>({
  children,
  onNewClick,
  onBatchDeleteClick,
  data,
  isLoading,
  renderTableRowKeyValue: renderPostKeyValue,
  columns,
  renderCardBody,
  renderCardFooter,
}: ListTableWrapperProps<T, Data>) => {
  const ctxValue = useMemo(createDefaultCtxValue, [])
  const [page, , setPage] = useQueryPager()
  const isMobile = useIsMobile()
  const viewStyle = useAtomValue(ctxValue.viewStyleAtom)
  if (!data) {
    return (
      <Spinner className="w-full flex items-center justify-center h-[300px]" />
    )
  }
  const { data: listData, pagination } = data || {}

  return (
    <ListTableContext.Provider value={ctxValue}>
      <Header onNewClick={onNewClick} onBatchDeleteClick={onBatchDeleteClick} />

      {children}

      {viewStyle == ViewStyle.Table && !isMobile ? (
        <TableRender
          data={listData}
          renderPostKeyValue={renderPostKeyValue}
          columns={columns}
          isLoading={isLoading}
        />
      ) : (
        <CardsRender
          data={listData}
          renderCardBody={renderCardBody}
          renderCardFooter={renderCardFooter}
          isLoading={isLoading}
        />
      )}

      {!!pagination && pagination.totalPage > 1 && (
        <motion.div
          layout="position"
          className="mt-8 flex w-full items-center justify-end gap-4"
        >
          <Pagination
            total={pagination.totalPage}
            initialPage={page}
            variant="light"
            onChange={setPage}
          />
        </motion.div>
      )}
    </ListTableContext.Provider>
  )
}

export type ListColumn<T, Key extends string = string> = Omit<
  TableColumnProps<T>,
  'key' | 'children'
> & {
  label: ReactNode
  key: Key
}

interface TableRenderProps<
  T extends DataBaseType,
  Col extends ListColumn<T> = ListColumn<T>,
  Cols extends Col[] = Col[],
> {
  isLoading?: boolean
  columns: Cols
  renderPostKeyValue: (data: T, key: Cols[number]['key']) => React.ReactNode
  data?: T[]
}

const TableRender = <T extends DataBaseType>({
  isLoading,
  data,
  columns,
  renderPostKeyValue,
}: TableRenderProps<T>) => {
  const { selectionAtom } = useContext(ListTableContext)
  const [selection, setSelection] = useAtom(selectionAtom)
  return (
    <Table
      className="min-h-[32.8rem] overflow-auto bg-transparent [&_table]:min-w-[1000px]"
      removeWrapper
      selectionMode="multiple"
      onSelectionChange={useEventCallback((e) => {
        setSelection(new Set(e) as Set<string>)
      })}
      selectedKeys={selection}
    >
      <TableHeader>
        {columns.map((column) => (
          // @ts-expect-error
          <TableColumn key={column.key} {...column}>
            {column.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        emptyContent="这里空空如也"
        items={data || []}
      >
        {(item) => (
          <TableRow key={item!.id}>
            {(columnKey) => (
              <TableCell>
                {renderPostKeyValue(item! as any, columnKey as any)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

interface CardsRenderProps<T extends DataBaseType> {
  isLoading?: boolean
  renderCardBody: (data: T) => React.ReactNode
  renderCardFooter: (data: T) => React.ReactNode
  data: T[]
}

const CardsRender = <T extends DataBaseType>({
  data,
  renderCardBody,
  renderCardFooter,
  isLoading,
}: CardsRenderProps<T>) => {
  const { selectionAtom } = useContext(ListTableContext)
  const store = useStore()
  return (
    <div className="min-h-[32.8rem] grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 4k:grid-cols-8 gap-4 mb-8">
      {data.map((item) => {
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
                defaultSelected={store.get(selectionAtom).has(item.id)}
                onValueChange={(value) => {
                  store.set(selectionAtom, (prev) => {
                    if (value) {
                      prev.add(item.id)
                    } else {
                      prev.delete(item.id)
                    }
                    return new Set(prev)
                  })
                }}
              />
              <TitleExtra data={item} />
            </CardHeader>
            <Divider />
            <CardBody className="text-small flex flex-col gap-2">
              {/* <p>
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
              </p> */}
              {renderCardBody(item)}
            </CardBody>
            <CardFooter className="flex justify-end">
              {renderCardFooter(item)}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
