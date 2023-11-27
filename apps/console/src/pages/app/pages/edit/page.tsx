import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { produce } from 'immer'
import { atom } from 'jotai'
import { cloneDeep, omit } from 'lodash-es'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { PageDto } from '@core/modules/page/page.dto'
import type { PageModel } from '~/models/page'
import type { FC } from 'react'

import {
  ImportMarkdownButton,
  PreviewButton,
} from '~/components/biz/special-button'
import { BaseWritingProvider } from '~/components/biz/writing/provider'
import { useEditorRef, Writing } from '~/components/biz/writing/Writing'
import { PageLoading } from '~/components/common/PageLoading'
import {
  PageModelDataAtomProvider,
  usePageModelGetModelData,
  usePageModelSetModelData,
} from '~/components/modules/page-editing/data-provider'
import { PageSlugInput } from '~/components/modules/page-editing/PageSlugInput'
import { PageEditorSidebar } from '~/components/modules/page-editing/sidebar'
import { EditorLayer } from '~/components/modules/writing/EditorLayer'
import { Button, ButtonGroup } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

const createInitialEditingData = (): PageModel => {
  return {
    title: '',
    subtitle: '',
    allowComment: true,

    id: '',
    images: [],

    slug: '',
    order: 0,
    text: '',
    meta: {},
  }
}
export default function EditPage_() {
  const [search] = useSearchParams()
  const id = search.get('id')
  const { data, isLoading } = trpc.page.id.useQuery(
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
  initialData?: PageModel
}> = (props) => {
  const [editingData] = useState<PageModel>(() =>
    props.initialData
      ? cloneDeep(props.initialData)
      : createInitialEditingData(),
  )

  const t = useI18n()

  const editingAtom = useMemo(() => atom(editingData), [editingData])

  return (
    <PageModelDataAtomProvider overrideAtom={editingAtom}>
      <BaseWritingProvider atom={editingAtom}>
        <EditorLayer>
          <>
            {props.initialData ? (
              <>
                {t('common.editing')} 「{editingData.title}」
              </>
            ) : (
              t('common.new-page')
            )}
          </>
          <ActionButtonGroup initialData={props.initialData} />
          <Writing middleSlot={PageSlugInput} />
          <PageEditorSidebar />
        </EditorLayer>
      </BaseWritingProvider>
    </PageModelDataAtomProvider>
  )
}

const ActionButtonGroup = ({ initialData }: { initialData?: PageModel }) => {
  const t = useI18n()
  const getData = usePageModelGetModelData()
  const setData = usePageModelSetModelData()
  const { mutateAsync: updatePage } = trpc.page.update.useMutation()
  const { mutateAsync: createPage } = trpc.page.create.useMutation()

  const trpcUtil = trpc.useUtils()

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
    <>
      <ButtonGroup variant="outline">
        <PreviewButton getData={getData} />
        <ImportMarkdownButton onParsedValue={handleParsed} />
      </ButtonGroup>
      <Button
        color="primary"
        onClick={() => {
          const currentData = {
            ...getData(),
          }

          const payload: PageDto & {
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

          const isCreate = !currentData.id
          const promise = isCreate
            ? createPage(payload).then((res) => {
                toast.success(t('common.create-success'))
                router.navigate(
                  routeBuilder(Routes.PageEditOrNew, {
                    id: res.id,
                  }),
                )
              })
            : updatePage(payload).then(() => {
                toast.success(t('common.save-success'))
              })
          promise
            .catch((err) => {
              toast.error(err.message)
            })
            .then(() => {
              trpcUtil.page.id.invalidate({ id: currentData.id })
              trpcUtil.page.all.invalidate()
            })
        }}
      >
        {initialData ? t('common.save') : t('common.submit')}
      </Button>
    </>
  )
}
