import { FC } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Loading } from '~/components/common/Loading'
import { RouterOutputs, trpc } from '~/lib/trpc'

export default () => {
  const [search] = useSearchParams()
  const id = search.get('id')
  const { data, isLoading } = trpc.post.id.useQuery(
    { id: id! },
    { enabled: !!id },
  )

  if (id) {
    if (isLoading) return <Loading />

    return <EditPage initialData={data} />
  }
  return <EditPage />
}

const EditPage: FC<{
  initialData?: RouterOutputs['post']['id']
}> = (props) => {
  return <div>edit {props.initialData?.id}</div>
}
