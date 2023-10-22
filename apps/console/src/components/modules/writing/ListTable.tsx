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
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { motion } from 'framer-motion'
import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { get } from 'lodash-es'
import { useEventCallback } from 'usehooks-ts'
import type { TableColumnProps } from '@nextui-org/react'
import type { PaginationResult } from '~/models/paginator'
import type { FC, PropsWithChildren, ReactNode } from 'react'

import { useIsMobile } from '~/atoms'
import { Empty } from '~/components/common/Empty'
import { AddCircleLine } from '~/components/icons'
import { RelativeTime } from '~/components/ui/date-time'
import { MotionDivToBottom } from '~/components/ui/motion'
import { useQueryPager } from '~/hooks/biz/use-query-pager'
import { useRefValue } from '~/hooks/common/use-ref-value'
import { useI18n } from '~/i18n/hooks'
import { clsxm } from '~/lib/helper'
import { buildNSKey } from '~/lib/key'
import { formatNumber } from '~/lib/transformer'
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
  onNewClick?: () => void
  onBatchDeleteClick?: (ids: string[]) => void
  canDisplayCardView: boolean
}

const Header: FC<HeaderProps> = ({
  canDisplayCardView,
  onNewClick,
  onBatchDeleteClick,
}) => {
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
                  onBatchDeleteClick?.(Array.from(selection))
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
      onNewClick?.()
    }
  })
  const isMobile = useIsMobile()
  return (
    <div className="mb-6 flex h-12 justify-between space-x-2">
      {!isMobile && canDisplayCardView ? (
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

        {(onNewClick || onBatchDeleteClick) && (
          <Button
            onClick={actionButtonClick}
            variant="shadow"
            color={hasSelection ? 'danger' : 'primary'}
          >
            {hasSelection ? (
              <i className="icon-[mingcute--delete-2-line]" />
            ) : (
              <AddCircleLine />
            )}
            {hasSelection ? t('common.delete') : t('common.new')}
          </Button>
        )}
      </div>
    </div>
  )
}

type DataBaseType = {
  id: string
  title: string
  isPublished?: boolean
  created?: string | Date
}

type ListTableWrapperProps<
  Data extends DataBaseType,
  Col extends ListColumn<Data> = ListColumn<Data>,
  Cols extends Col[] = Col[],
> = PropsWithChildren<{
  data?: PaginationResult<Data> | null | Data[]
  isLoading?: boolean
  renderTableRowKeyValue?: (
    data: Data,
    key: Cols[number]['key'],
  ) => React.ReactNode
}> &
  Pick<TableRenderProps<Data, Col, Cols>, 'columns'> &
  Partial<Pick<CardsRenderProps<Data>, 'renderCardBody' | 'renderCardFooter'>> &
  Omit<HeaderProps, 'canDisplayCardView'> & {
    tableClassName?: string
  }

export const ListTable = <Data extends DataBaseType>({
  onNewClick,
  onBatchDeleteClick,
  data,
  isLoading,
  renderTableRowKeyValue: renderPostKeyValue,
  columns,
  renderCardBody,
  renderCardFooter,
  tableClassName,
}: ListTableWrapperProps<Data>) => {
  const ctxValue = useMemo(createDefaultCtxValue, [])
  const [page, , setPage] = useQueryPager()
  const isMobile = useIsMobile()
  const viewStyle = useAtomValue(ctxValue.viewStyleAtom)
  if (!data) {
    return (
      <Spinner className="w-full flex items-center justify-center h-[300px]" />
    )
  }
  const { data: listData, pagination } = Array.isArray(data)
    ? { data, pagination: null }
    : data || {}

  const canDisplayCardView = !!renderCardBody && !!renderCardFooter

  return (
    <ListTableContext.Provider value={ctxValue}>
      <Header
        canDisplayCardView={canDisplayCardView}
        onNewClick={onNewClick}
        onBatchDeleteClick={onBatchDeleteClick}
      />

      {(viewStyle == ViewStyle.Table && !isMobile) || !canDisplayCardView ? (
        <TableRender
          data={listData}
          renderPostKeyValue={renderPostKeyValue}
          columns={columns}
          isLoading={isLoading}
          tableClassName={tableClassName}
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
            showControls
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
type ColDataType = 'text' | 'datetime' | 'number'
export type ListColumn<T, Key extends string = string> = Omit<
  TableColumnProps<T>,
  'key' | 'children'
> & {
  label: ReactNode
  key: Key
  render?: (data: T) => ReactNode

  type?: ColDataType
}

interface TableRenderProps<
  T extends DataBaseType,
  Col extends ListColumn<T> = ListColumn<T>,
  Cols extends Col[] = Col[],
> {
  isLoading?: boolean
  columns: Cols
  renderPostKeyValue?: (data: T, key: Cols[number]['key']) => React.ReactNode
  data?: T[]

  tableClassName?: string
}

const TableRender = <T extends DataBaseType>({
  isLoading,
  data,
  columns,
  renderPostKeyValue,
  tableClassName: className,
}: TableRenderProps<T>) => {
  const { selectionAtom } = useContext(ListTableContext)
  const [selection, setSelection] = useAtom(selectionAtom)

  const [memoColumns] = useState(columns)
  const colKeyMap = useMemo(() => {
    return memoColumns.reduce(
      (prev, curr) => {
        prev[curr.key] = curr
        return prev
      },
      {} as Record<string, ListColumn<T>>,
    )
  }, [memoColumns])

  const renderValue = useCallback(
    (payload: {
      item: T
      key: string
      col: ListColumn<T>
      type?: ColDataType
    }) => {
      const { item, key } = payload
      switch (payload.type) {
        case 'datetime': {
          if (!item[key]) return '-'
          return <RelativeTime time={item[key]} />
        }
        case 'number':
          return formatNumber(+get(item, key) ?? 0)
        case 'text':
        default:
          return get(item, key) ?? ''
      }
    },
    [],
  )
  return (
    <Table
      className={clsxm(
        'min-h-[32.8rem] overflow-auto bg-transparent [&_table]:min-w-[1000px] relative',
        className,
      )}
      removeWrapper
      selectionMode="multiple"
      onSelectionChange={useEventCallback((e) => {
        if (e === 'all') {
          setSelection(new Set(data!.map((item) => item.id)))
          return
        }
        setSelection(new Set(e) as Set<string>)
      })}
      selectedKeys={selection}
      isHeaderSticky
    >
      <TableHeader>
        {memoColumns.map((column) => (
          // @ts-expect-error
          <TableColumn key={column.key} {...column}>
            {column.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody
        loadingState={isLoading ? 'loading' : 'idle'}
        loadingContent={
          <Spinner className="absolute inset-0 flex items-center justify-center" />
        }
        emptyContent={<Empty />}
        items={data || []}
      >
        {(item) => (
          <TableRow key={item!.id}>
            {(columnKey) => (
              <TableCell>
                {colKeyMap[columnKey as string].render?.(item) ??
                  renderPostKeyValue?.(item! as any, columnKey as any) ??
                  renderValue({
                    item,
                    key: columnKey as any,
                    col: colKeyMap[columnKey as string],
                    type: colKeyMap[columnKey as string].type,
                  })}
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
  const columnsCountBreakPoints = useRefValue(() => ({
    640: 1,
    768: 2,
    1024: 3,
    1280: 4,
    1536: 5,
    1920: 6,
  }))
  return (
    <ResponsiveMasonry
      className="min-h-[32.8rem] relative"
      columnsCountBreakPoints={columnsCountBreakPoints}
    >
      <Masonry gutter="16px">
        {data.map((item) => (
          <MemoedCard
            item={item}
            renderCardBody={renderCardBody}
            renderCardFooter={renderCardFooter}
            key={item.id}
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  )
}

const MemoedCardImpl = <T extends DataBaseType>({
  item,

  renderCardBody,
  renderCardFooter,
}: {
  item: T
} & Pick<CardsRenderProps<T>, 'renderCardBody' | 'renderCardFooter'>) => {
  const { selectionAtom } = useContext(ListTableContext)
  const store = useStore()
  return (
    <Card
      as={MotionDivToBottom}
      shadow="none"
      className="ring-1 ring-zinc-200/60 dark:ring-neutral-800/70"
      key={item.id}
    >
      <CardHeader className="flex gap-2 px-5 justify-between">
        <TitleExtra className="font-medium text-lg" data={item} />

        <span className="opacity-60 flex-shrink-0">
          {item.created ? <RelativeTime time={item.created} /> : null}
        </span>
      </CardHeader>
      <Divider />
      <CardBody className="px-5 text-small flex flex-col gap-2">
        {renderCardBody(item)}
      </CardBody>
      <CardFooter className="!py-1 flex justify-between bg-foreground-100/50">
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
        {renderCardFooter(item)}
      </CardFooter>
    </Card>
  )
}
const MemoedCard = memo(MemoedCardImpl) as typeof MemoedCardImpl
