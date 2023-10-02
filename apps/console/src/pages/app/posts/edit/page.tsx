import { Button, ButtonGroup } from '@nextui-org/react'
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { produce } from 'immer'
import { atom } from 'jotai'
import { cloneDeep, omit } from 'lodash-es'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { PostDto } from '@core/modules/post/post.dto'
import type { PostModel } from '~/models/post'
import type { FC } from 'react'

import {
  ImportMarkdownButton,
  PreviewButton,
} from '~/components/biz/logic-button'
import { BaseWritingProvider } from '~/components/biz/writing/provider'
import { useEditorRef, Writing } from '~/components/biz/writing/Writing'
import { PageLoading } from '~/components/common/PageLoading'
import {
  PostModelDataAtomProvider,
  usePostModelGetModelData,
  usePostModelSetModelData,
} from '~/components/modules/post-editing/data-provider'
import { PostEditorSidebar } from '~/components/modules/post-editing/sidebar'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

const createInitialEditingData = (): PostModel => {
  return {
    title: '',
    allowComment: true,
    copyright: true,
    tagIds: [],
    categoryId: '',
    id: '',
    images: [],
    isPublished: true,
    pin: false,
    slug: '',
    tags: [],
    text: '',
    meta: {},
    related: [],
    relatedIds: [],
    summary: null,
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
    if (isLoading) return <PageLoading />

    return <EditPage initialData={data} />
  }
  return <EditPage />
}

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
    <PostModelDataAtomProvider overrideAtom={editingAtom}>
      <BaseWritingProvider atom={editingAtom}>
        <div className="flex justify-between">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center text-lg font-medium">
              {props.initialData ? (
                <>
                  {t('common.editing')} 「{editingData.title}」
                </>
              ) : (
                t('common.new-post')
              )}
            </p>
          </div>

          <ActionButtonGroup initialData={props.initialData} />
        </div>

        <div className="flex flex-grow lg:grid lg:grid-cols-[auto_400px] lg:gap-4">
          <div className="flex flex-grow flex-col overflow-auto">
            <Writing />
          </div>

          <PostEditorSidebar />
        </div>
      </BaseWritingProvider>
    </PostModelDataAtomProvider>
  )
}

const ActionButtonGroup = ({ initialData }: { initialData?: PostModel }) => {
  const t = useI18n()
  const getData = usePostModelGetModelData()
  const setData = usePostModelSetModelData()
  const { mutateAsync: updatePost } = trpc.post.update.useMutation()
  const { mutateAsync: createPost } = trpc.post.create.useMutation()

  const trpcUtil = trpc.useContext()

  const editorRef = useEditorRef()
  const handleParsed = useEventCallback(
    (data: {
      title?: string | undefined
      text: string
      meta?: Record<string, any> | undefined
    }): void => {
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
    },
  )
  return (
    <div className="space-x-2 lg:space-x-4">
      <ButtonGroup variant="ghost">
        <PreviewButton getData={getData} />
        <ImportMarkdownButton onParsedValue={handleParsed} />
      </ButtonGroup>
      <Button
        color="primary"
        variant="shadow"
        onClick={() => {
          const currentData = {
            ...getData(),
          }

          const payload: PostDto & {
            id: string
          } = {
            ...currentData,
          }

          if (
            currentData.created === initialData?.created &&
            currentData.created
          ) {
            payload.custom_created = new Date(currentData.created)
          }

          Reflect.deleteProperty(currentData, 'category')

          const isCreate = !currentData.id
          const promise = isCreate
            ? createPost(payload).then(() => {
                toast.success(t('common.create-success'))
              })
            : updatePost(payload).then(() => {
                toast.success(t('common.save-success'))
              })
          promise
            .catch((err) => {
              toast.error(err.message)
            })
            .then(() => {
              trpcUtil.post.id.invalidate({ id: currentData.id })
              trpcUtil.post.paginate.invalidate()
              trpcUtil.post.relatedList.invalidate()

              // TODO back to list or dialog
            })
        }}
      >
        {t('common.submit')}
      </Button>
    </div>
  )
}
