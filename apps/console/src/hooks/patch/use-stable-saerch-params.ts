import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useStableSearchParams: typeof useSearchParams = () => {
  const [search, setSearchParams] = useSearchParams()

  const ref = useRef(setSearchParams)
  ref.current = setSearchParams
  return [
    search,

    useCallback((...args) => {
      ref.current(...args)
    }, []),
  ]
}
