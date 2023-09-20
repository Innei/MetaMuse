import { useQuery } from '@tanstack/react-query'
import { FC } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Loading } from '~/components/common/Loading'
import { $axios } from '~/lib/request'
import { PostModel } from '~/models/post'

export default () => {
  const [search] = useSearchParams()
  const id = search.get('id')

  const { data, isLoading } = useQuery(
    ['post', id],
    async () => {
      return $axios.get(`/admin/posts/${id}`)
    },
    {
      meta: {
        persist: false,
      },
      enabled: !!id,
    },
  )

  if (id) {
    if (isLoading) return <Loading />

    return <EditPage initialData={data} />
  }
  return <EditPage />
}

const EditPage: FC<{
  initialData?: PostModel
}> = () => {
  return 'EditPage'
}
