import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type LiteralToBroad<T> = T extends number
  ? number
  : T extends string
  ? string
  : T extends boolean
  ? boolean
  : T // Default case
export const useRouterQueryState = <T extends string | number>(
  queryKey: string,
  initialState: LiteralToBroad<T>,
) => {
  const [state, setState] = useState<LiteralToBroad<T>>(initialState)

  const [searchParams, setSearchParams] = useSearchParams()

  useLayoutEffect(() => {
    const queryValue = searchParams.get(queryKey)
    if (queryValue === null) {
      setSearchParams((prev) => {
        prev.set(queryKey, String(initialState))
        return prev
      })
    }
  }, [])

  const stateFromQuery = searchParams.get(queryKey)
  useEffect(() => {
    setState(stateFromQuery as LiteralToBroad<T>)
  }, [stateFromQuery])

  return [
    state,
    useCallback(
      (state: LiteralToBroad<T>) => {
        setSearchParams((prev) => {
          prev.set(queryKey, String(state))
          return prev
        })
      },
      [queryKey, setSearchParams],
    ),
  ] as const
}
