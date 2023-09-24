import { Input } from '@nextui-org/react'
import { createModelDataProvider } from 'jojoo/react'
import React, { FC, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { produce } from 'immer'
import { atom } from 'jotai'
import { cloneDeep } from 'lodash-es'

import { Loading } from '~/components/common/Loading'
import { useI18n } from '~/i18n/hooks'
import { RouterOutputs, trpc } from '~/lib/trpc'

type PostModel = Omit<
  RouterOutputs['post']['id'],
  | '_count'
  | 'category'
  | 'created'
  | 'modified'
  | 'relatedBy'
  | 'related'
  | 'meta'
> & {
  meta?: any
}

const craeteInitialEdtingData = (): PostModel => {
  return {
    title: '',
    allowComment: true,
    copyright: true,
    categoryId: '',
    id: '',
    images: [],
    isPublished: false,
    pin: false,
    slug: '',
    tags: [],
    text: '',
    meta: {},
  }
}
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

const {
  useModelDataSelector,
  useSetModelData,

  ModelDataAtomProvider,
} = createModelDataProvider<PostModel>()

const EditPage: FC<{
  initialData?: PostModel
}> = (props) => {
  const [editingData] = useState<PostModel>(() =>
    props.initialData
      ? cloneDeep(props.initialData)
      : craeteInitialEdtingData(),
  )

  const t = useI18n()

  return (
    <div>
      <ModelDataAtomProvider
        overrideAtom={useMemo(() => atom(editingData), [editingData])}
      >
        {!!editingData && (
          <p className="mb-3 text-lg font-medium">
            {t('common.editing')} 「{editingData.title}」
          </p>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-4">
          <div className="col-span-2">
            <HeaderInput />
          </div>
          <div className="hidden flex-col lg:col-span-1 lg:flex">Sidebar</div>
        </div>
      </ModelDataAtomProvider>
    </div>
  )
}

const HeaderInput = () => {
  const title = useModelDataSelector((data) => data?.title)
  const setter = useSetModelData()
  const t = useI18n()
  return (
    <Input
      label={t('common.title')}
      value={title}
      variant="bordered"
      onChange={(e) =>
        setter(
          produce((draft) => {
            draft.title = e.target.value
          }),
        )
      }
    />
  )
}
