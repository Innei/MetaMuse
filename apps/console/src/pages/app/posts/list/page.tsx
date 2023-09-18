import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Post } from '@model'
import useSWR from 'swr'

import { PaginationResult } from '@core/shared/interface/paginator.interface'

import { useBeforeMounted } from '~/hooks/use-before-mounted'
import { $axios } from '~/lib/request'

export default () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const { search } = useLocation()

  useBeforeMounted(() => {
    try {
      new URLSearchParams(search).forEach((value, key) => {
        if (key === 'page') {
          setPage(Number(value))
        }
        if (key === 'size') {
          setSize(Number(value))
        }
      })
    } catch {}
  })

  useSWR(['/posts', page, size], async () => {
    return $axios.get<PaginationResult<Post>>('/admin/posts', {
      params: {
        page,
        size,
      },
    })
  })
  return null
}
