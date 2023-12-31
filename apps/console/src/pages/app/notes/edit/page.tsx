import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { t } from 'i18next'
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
} from '~/components/biz/special-button'
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
import { Button } from '~/components/ui/button'
import { ButtonGroup } from '~/components/ui/button/button-group'
import { useI18n } from '~/i18n/hooks'
import { getDayOfYear } from '~/lib/datetime'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

const createInitialEditingData = (): NoteModel => {
  const created = new Date()
  return {
    title: t('module.notes.title_label', {
      year: created.getFullYear(),
      day: getDayOfYear(created),
    }),
    allowComment: true,
    hasMemory: false,

    id: '',
    location: null,
    coordinates: null,
    images: [],
    isPublished: true,
    mood: null,
    nid: null!,
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
  const { data, isLoading, error } = trpc.note.id.useQuery(
    { id: id! },
    { enabled: !!id },
  )

  if (id) {
    if (isLoading) return <PageLoading />

    if (error) {
      toast.error(error.message)
      return null
    }

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
  const created = editingData.created ? new Date(editingData.created) : null

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
          <Writing
            middleSlot={NoteEditorUrlPlaceholder}
            titleLabel={
              created
                ? t('module.notes.title_label', {
                    year: created.getFullYear(),
                    day: getDayOfYear(created),
                  })
                : undefined
            }
          />
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
      <ButtonGroup variant="outline">
        <PreviewButton getData={getData} />
        <ImportMarkdownButton onParsedValue={handleParsed} />
      </ButtonGroup>

      <Button
        variant="default"
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
