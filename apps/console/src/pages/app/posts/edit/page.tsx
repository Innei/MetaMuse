import React, { FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cloneDeep } from 'lodash-es'
import { useImmer } from 'use-immer'

import { Loading } from '~/components/common/Loading'
import { useI18n } from '~/i18n/hooks'
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
  const [clonedData, setClonedData] = useImmer(() =>
    cloneDeep(props.initialData),
  )
  const t = useI18n()

  return (
    <div>
      {!!clonedData && (
        <p className="">
          {t('common.editing')} {clonedData.title}
        </p>
      )}
    </div>
  )
}
