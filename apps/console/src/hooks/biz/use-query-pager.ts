import { createContext, createElement, useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { atom, useAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai'
import type { FC } from 'react'

import { useBeforeMounted } from '../common/use-before-mounted'

const ctx = createContext<{
  pageAtom: PrimitiveAtom<number>
  sizeAtom: PrimitiveAtom<number>
}>(null!)

export const useQueryPager = () => {
  const pCtx = useContext(ctx)
  if (!pCtx) throw new Error('useQueryPager must be used in QueryPagerProvider')
  const { pageAtom, sizeAtom } = pCtx
  const [page, setPage] = useAtom(pageAtom)
  const [size, setSize] = useAtom(sizeAtom)

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

  useEffect(() => {
    setSearch((p) => ({ ...p, page, size }))
  }, [page, setSearch, size])

  return [page, size, setPage, setSize] as const
}

export const withQueryPager = <T extends {}>(Component: FC<T>): FC<T> => {
  const ctxValue = {
    pageAtom: atom(1),
    sizeAtom: atom(10),
  }
  return function QueryPagerProvider(props) {
    return createElement(
      ctx.Provider,
      {
        value: ctxValue,
      },
      createElement(Component, props),
    )
  }
}
