import { Button } from '@nextui-org/react'
import { createModelDataProvider } from 'jojoo/react'
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { atom } from 'jotai'
import { cloneDeep, isString } from 'lodash-es'
import { toast } from 'sonner'
import type { RouterOutputs } from '~/lib/trpc'
import type { FC } from 'react'

import { BaseWritingProvider } from '~/components/biz/writing/provider'
import { Writing } from '~/components/biz/writing/Writing'
import { Loading } from '~/components/common/Loading'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

type PostModel = Omit<
  RouterOutputs['post']['id'],
  | '_count'
  | 'category'
  | 'created'
  | 'modified'
  | 'relatedBy'
  | 'meta'
  | 'count'
> & {
  meta?: any
}

const createInitialEditingData = (): PostModel => {
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
    related: [],
  }
}
export default function EditPage_() {
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
      : createInitialEditingData(),
  )

  const t = useI18n()

  const editingAtom = useMemo(() => atom(editingData), [editingData])

  return (
    <ModelDataAtomProvider overrideAtom={editingAtom}>
      <div className="flex justify-between">
        <div>
          <p className="mb-3 text-lg font-medium">
            {props.initialData ? (
              <>
                {t('common.editing')} 「{editingData.title}」
              </>
            ) : (
              t('common.new-post')
            )}
          </p>
        </div>

        <div>
          <ActionButtonGroup />
        </div>
      </div>

      <div className="flex-grow lg:grid lg:grid-cols-3 lg:gap-4">
        <BaseWritingProvider atom={editingAtom}>
          <div className="col-span-2 flex flex-grow flex-col overflow-auto">
            <Writing />
          </div>
        </BaseWritingProvider>

        <div className="hidden flex-col lg:col-span-1 lg:flex">Sidebar</div>
      </div>
    </ModelDataAtomProvider>
  )
}
const ActionButtonGroup = () => {
  const t = useI18n()
  const getData = useGetModelData()
  const { mutateAsync: submit } = trpc.post.update.useMutation()
  return (
    <>
      <Button
        color="primary"
        variant="flat"
        onClick={() => {
          const currentData = {
            ...getData(),
          } as Omit<PostModel, 'related'> & {
            related: any
          }

          Reflect.deleteProperty(currentData, 'category')

          if (currentData.related.length > 0) {
            currentData.related = currentData.related.map((item: any) => {
              return isString(item) ? item : item.id
            })
          }

          submit(currentData).then(() => {
            toast.success(t('common.save-success'))

            // TODO back to list or dialog
          })
        }}
      >
        {t('common.submit')}
      </Button>
    </>
  )
}
