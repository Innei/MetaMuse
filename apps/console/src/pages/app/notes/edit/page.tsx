import { Button, ButtonGroup } from '@nextui-org/react'
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { produce } from 'immer'
import { atom } from 'jotai'
import { cloneDeep, omit } from 'lodash-es'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { NoteDto } from '@core/modules/note/note.dto'
import type { NoteModel } from '~/models/note'
import type { FC } from 'react'

import {
  ImportMarkdownButton,
  PreviewButton,
} from '~/components/biz/logic-button'
import { BaseWritingProvider } from '~/components/biz/writing/provider'
import { useEditorRef, Writing } from '~/components/biz/writing/Writing'
import { PageLoading } from '~/components/common/PageLoading'
import {
  NoteEditorSidebar,
  NoteEditorUrlPlaceholder,
} from '~/components/modules/note-editing'
import {
  NoteModelDataAtomProvider,
  useNoteModelGetModelData,
  useNoteModelSetModelData,
} from '~/components/modules/note-editing/data-provider'
import { EditorLayer } from '~/components/modules/writing/EditorLayer'
import { useI18n } from '~/i18n/hooks'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

const createInitialEditingData = (): NoteModel => {
  return {
    title: '',
    allowComment: true,
    location: null,
    hasMemory: false,

    id: '',
    coordinates: null,
    images: [],
    isPublished: true,
    mood: null,
    nid: 0,
    password: '',
    publicAt: null,
    topicId: null,
    weather: null,

    text: '',
    meta: {},
  }
}
export default function EditPage_() {
  const [search] = useSearchParams()
  const id = search.get('id')
  const { data, isLoading } = trpc.note.id.useQuery(
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
  initialData?: NoteModel
}> = (props) => {
  const [editingData] = useState<NoteModel>(() =>
    props.initialData
      ? cloneDeep(props.initialData)
      : createInitialEditingData(),
  )

  const t = useI18n()

  const editingAtom = useMemo(() => atom(editingData), [editingData])

  return (
    <NoteModelDataAtomProvider overrideAtom={editingAtom}>
      <BaseWritingProvider atom={editingAtom}>
        <EditorLayer>
          <>
            {props.initialData ? (
              <>
                {t('common.editing')} 「{editingData.title}」
              </>
            ) : (
              t('common.new-note')
            )}
          </>
          <ActionButtonGroup initialData={props.initialData} />
          <Writing middleSlot={NoteEditorUrlPlaceholder} />
          <NoteEditorSidebar />
        </EditorLayer>
      </BaseWritingProvider>
    </NoteModelDataAtomProvider>
  )
}

const ActionButtonGroup = ({ initialData }: { initialData?: NoteModel }) => {
  const t = useI18n()
  const getData = useNoteModelGetModelData()
  const setData = useNoteModelSetModelData()
  const { mutateAsync: updateNote } = trpc.note.update.useMutation()
  const { mutateAsync: createNote } = trpc.note.create.useMutation()

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

            if (meta.mood) draft.mood = meta.mood
            if (meta.weather) draft.weather = meta.weather

            draft.meta = meta
          }
        })
      })
    },
  )
  return (
    <>
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

          const payload: NoteDto & {
            id: string
          } = {
            ...currentData,
            publicAt: currentData.publicAt
              ? new Date(currentData.publicAt)
              : undefined,
          }

          if (
            currentData.created === initialData?.created &&
            currentData.created
          ) {
            payload.custom_created = new Date(currentData.created)
          }

          Reflect.deleteProperty(currentData, 'nid')

          const isCreate = !currentData.id
          const promise = isCreate
            ? createNote(payload).then((res) => {
                toast.success(t('common.create-success'))
                router.navigate(
                  routeBuilder(Routes.NoteEditOrNew, {
                    id: res.id,
                  }),
                )
              })
            : updateNote(payload).then(() => {
                toast.success(t('common.save-success'))
              })
          promise
            .catch((err) => {
              toast.error(err.message)
            })
            .then(() => {
              trpcUtil.note.id.invalidate({ id: currentData.id })
              trpcUtil.note.paginate.invalidate()

              // TODO back to list or dialog
            })
        }}
      >
        {initialData ? t('common.save') : t('common.submit')}
      </Button>
    </>
  )
}
