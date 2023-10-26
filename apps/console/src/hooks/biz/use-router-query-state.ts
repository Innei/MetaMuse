import { useCallback, useEffect, useState } from 'react'

import { useStableSearchParams } from '../patch/use-stable-saerch-params'

type LiteralToBroad<T> = T extends number
  ? number
  : T extends string
  ? string
  : T extends boolean
  ? boolean
  : T // Default case
export const useRouterQueryState = <T extends string | number>(
  queryKey: string,
  fallbackState: LiteralToBroad<T>,
) => {
  const [state, setState] = useState<LiteralToBroad<T>>(fallbackState)

  const [searchParams, setSearchParams] = useStableSearchParams()

  const stateFromQuery = searchParams.get(queryKey)
  useEffect(() => {
    console.log(stateFromQuery)
    setState(stateFromQuery as LiteralToBroad<T>)
  }, [stateFromQuery])

  return [
    state ?? fallbackState,
    useCallback(
      (state: LiteralToBroad<T>) => {
        setSearchParams((prev) => {
          prev.set(queryKey, String(state))
          return new URLSearchParams(prev)
        })
      },
      [queryKey, setSearchParams],
    ),
  ] as const
}
