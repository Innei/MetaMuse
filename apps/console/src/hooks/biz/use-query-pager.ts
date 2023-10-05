import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useBeforeMounted } from '../common/use-before-mounted'

export const useQueryPager = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

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

  return [page, size, setPage, setSize] as const
}
