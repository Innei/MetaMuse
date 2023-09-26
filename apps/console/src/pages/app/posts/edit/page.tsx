import { Button, Input } from '@nextui-org/react'
import { createModelDataProvider } from 'jojoo/react'
import React, { FC, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { atom, useAtom } from 'jotai'
import { cloneDeep } from 'lodash-es'

import {
  BaseWritingProvider,
  useBaseWritingContext,
} from '~/components/biz/writing/provider'
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
  | 'count'
> & {
  meta?: any
}

const createInitialEdtingData = (): PostModel => {
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
  useGetModelData,

  ModelDataAtomProvider,
} = createModelDataProvider<PostModel>()

const EditPage: FC<{
  initialData?: PostModel
}> = (props) => {
  const [editingData] = useState<PostModel>(() =>
    props.initialData
      ? cloneDeep(props.initialData)
      : createInitialEdtingData(),
  )

  const t = useI18n()

  const editingAtom = useMemo(() => atom(editingData), [editingData])

  return (
    <div>
      <ModelDataAtomProvider overrideAtom={editingAtom}>
        <div className="flex justify-between">
          <div>
            {!!editingData && (
              <p className="mb-3 text-lg font-medium">
                {t('common.editing')} 「{editingData.title}」
              </p>
            )}
          </div>

          <div>
            <ActionButtonGroup />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-4">
          <BaseWritingProvider atom={editingAtom}>
            <div className="col-span-2">
              <HeaderInput />
            </div>
          </BaseWritingProvider>

          <div className="hidden flex-col lg:col-span-1 lg:flex">Sidebar</div>
        </div>
      </ModelDataAtomProvider>
    </div>
  )
}
const ActionButtonGroup = () => {
  const t = useI18n()
  const getData = useGetModelData()
  return (
    <>
      <Button
        color="primary"
        variant="flat"
        onClick={() => {
          console.log(getData())
        }}
      >
        {t('common.submit')}
      </Button>
    </>
  )
}
const HeaderInput = () => {
  const [title, setTitle] = useAtom(useBaseWritingContext().title)
  const t = useI18n()
  return (
    <Input
      label={t('common.title')}
      value={title}
      variant="bordered"
      onChange={(e) => setTitle(e.target.value)}
    />
  )
}
