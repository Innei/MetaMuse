import { Button, Select, SelectItem } from '@nextui-org/react'
import { createModelDataProvider } from 'jojoo/react'
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { produce } from 'immer'
import { atom } from 'jotai'
import { cloneDeep, isString, omit } from 'lodash-es'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { Selection } from '@nextui-org/react'
import type { RouterOutputs } from '~/lib/trpc'
import type { FC } from 'react'

import { ParseYAMLContentButton } from '~/components/biz/logic-button/ParseYAMLContentButton'
import { BaseWritingProvider } from '~/components/biz/writing/provider'
import { useEditorRef, Writing } from '~/components/biz/writing/Writing'
import { Loading } from '~/components/common/Loading'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

type PostModel = Omit<
  RouterOutputs['post']['id'],
  | '_count'
  | 'category'
  | 'modified'
  | 'relatedBy'
  | 'meta'
  | 'count'
  | 'created'
> & {
  meta?: any
  created?: string
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

        <ActionButtonGroup />
      </div>

      <div className="flex-grow lg:grid lg:grid-cols-3 lg:gap-4">
        <BaseWritingProvider atom={editingAtom}>
          <div className="col-span-2 flex flex-grow flex-col overflow-auto">
            <Writing />
          </div>
        </BaseWritingProvider>

        <div className="hidden flex-col lg:col-span-1 lg:flex">
          <Sidebar />
        </div>
      </div>
    </ModelDataAtomProvider>
  )
}

const Sidebar = () => {
  return (
    <div className="flex flex-col space-y-4">
      <CategorySelector />
    </div>
  )
}

const CategorySelector = () => {
  const t = useI18n()
  const { data = [], isLoading } = trpc.category.getAllForSelector.useQuery()
  const categoryId = useModelDataSelector((data) => data?.categoryId)
  const setter = useSetModelData()
  const handleSelectionChange = useEventCallback((value: Selection) => {
    const newCategoryId = Array.from(new Set(value).values())[0] as string
    if (newCategoryId === categoryId) return

    setter((prev) => {
      return produce(prev, (draft) => {
        draft.categoryId = newCategoryId
      })
    })
  })
  return (
    <div className="flex flex-col space-y-3">
      <Select
        className="mt-5"
        label={t('common.category')}
        labelPlacement="outside"
        isLoading={isLoading}
        selectedKeys={useMemo(() => new Set([categoryId]), [categoryId])}
        onSelectionChange={handleSelectionChange}
        variant="flat"
        size="sm"
      >
        {data?.map((item) => (
          <SelectItem key={item.id} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

const ActionButtonGroup = () => {
  const t = useI18n()
  const getData = useGetModelData()
  const setData = useSetModelData()
  const { mutateAsync: submit } = trpc.post.update.useMutation()

  const editorRef = useEditorRef()
  return (
    <div className="space-x-2 lg:space-x-4">
      <ParseYAMLContentButton
        onParsedValue={(data) => {
          setData((prev) => {
            return produce(prev, (draft) => {
              Object.assign(draft, omit(data, ['meta']))
              const meta = data.meta

              if (data.text) {
                editorRef?.setMarkdown(data.text)
              }

              if (meta) {
                const created = meta.created || meta.date
                const parsedCreated = created ? dayjs(created) : null

                if (parsedCreated) {
                  draft.created = parsedCreated.toISOString()
                }

                draft.meta = meta
              }
            })
          })
        }}
      />
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
    </div>
  )
}
