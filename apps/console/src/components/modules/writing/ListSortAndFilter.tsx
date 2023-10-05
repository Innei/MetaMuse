import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { createContext, useContext, useMemo } from 'react'
import { produce } from 'immer'
import { atom, useAtom, useAtomValue } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import { FilterLineIcon } from '~/components/icons'

const filterAtom = atom([] as string[])
const sortingAtom = atom({ key: 'created', order: 'desc' } as {
  key: string
  order: 'asc' | 'desc'
})

const ListSortAndFilterContext = createContext({
  filterAtom,
  sortingAtom,
})

export const defaultSortingKeyMap = {
  created: '创建时间',
  modified: '修改时间',
} as Record<string, string>

type SortingOrderListItem = {
  key: string
  label: string
}

export const defaultSortingOrderList = [
  {
    key: 'desc',
    label: '降序',
  },
  {
    key: 'asc',
    label: '升序',
  },
] as SortingOrderListItem[]

const ListSortAndFilterListContext = createContext({
  sortingKeyMap: defaultSortingKeyMap,
  sortingOrderList: defaultSortingOrderList,
})

export const ListSortAndFilterProvider: FC<
  PropsWithChildren<{
    sortingKeyMap?: Record<string, string>
    sortingOrderList?: SortingOrderListItem[]

    filterAtom: typeof filterAtom
    sortingAtom: typeof sortingAtom
  }>
> = (props) => {
  const { sortingOrderList, sortingKeyMap, children, sortingAtom, filterAtom } =
    props

  return (
    <ListSortAndFilterContext.Provider
      value={useMemo(
        () => ({
          filterAtom,
          sortingAtom,
        }),
        [filterAtom, sortingAtom],
      )}
    >
      <ListSortAndFilterListContext.Provider
        value={useMemo(
          () => ({
            sortingKeyMap: sortingKeyMap ?? defaultSortingKeyMap,
            sortingOrderList: sortingOrderList ?? defaultSortingOrderList,
          }),
          [sortingKeyMap, sortingOrderList],
        )}
      >
        {children}
      </ListSortAndFilterListContext.Provider>
    </ListSortAndFilterContext.Provider>
  )
}

const Filter = () => {
  // TODO
  return null
}

export const Sorting = () => {
  const { sortingAtom, filterAtom } = useContext(ListSortAndFilterContext)
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
        {Object.entries(defaultSortingKeyMap).map(([key, value]) => (
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
        {defaultSortingOrderList.map(({ key, label }) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

export const SortAndFilterButton = () => {
  const { sortingAtom } = useContext(ListSortAndFilterContext)
  const { sortingOrderList, sortingKeyMap } = useContext(
    ListSortAndFilterListContext,
  )
  const sorting = useAtomValue(sortingAtom)
  const isHasSorting = useMemo(() => {
    const firstSortingKey = Object.keys(sortingKeyMap)[0]
    return (
      sorting.key &&
      sorting.order &&
      !(
        sorting.key === firstSortingKey &&
        sorting.order === sortingOrderList[0].key
      )
    )
  }, [sorting.key, sorting.order, sortingKeyMap, sortingOrderList])

  return (
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
  )
}
