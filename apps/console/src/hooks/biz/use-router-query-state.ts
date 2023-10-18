import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useRouterQueryState = <T extends string | number>(
  queryKey: string,
  initialState: T,
) => {
  const [state, setState] = useState(initialState)

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
    setState(stateFromQuery as T)
  }, [stateFromQuery])

  return [
    state,
    useCallback(
      (state: T) => {
        setSearchParams((prev) => {
          prev.set(queryKey, String(state))
          return prev
        })
      },
      [queryKey, setSearchParams],
    ),
  ] as const
}
