import { createModelDataProvider } from 'jojoo/react'
import { useContext, useMemo } from 'react'
import { produce } from 'immer'
import { atom, useAtom } from 'jotai'
import type { NoteModel } from '~/models/note'

export const {
  useModelDataSelector: useNoteModelDataSelector,
  useSetModelData: useNoteModelSetModelData,
  useGetModelData: useNoteModelGetModelData,

  ModelDataAtomProvider: NoteModelDataAtomProvider,

  ModelDataAtomContext,
} = createModelDataProvider<NoteModel>()

export const useNoteModelSingleFieldAtom = <
  T extends keyof NoteModel = keyof NoteModel,
>(
  key: T,
) => {
  const ctxAtom = useContext(ModelDataAtomContext)
  if (!ctxAtom)
    throw new Error(
      'useNoteModelSingleFieldAtom must be used inside NoteModelDataAtomProvider',
    )
  const atomAccessor = useAtom(
    useMemo(() => {
      return atom(
        (get) => {
          const data = get(ctxAtom)

          return data?.[key]
        },
        (get, set, update: any) => {
          set(ctxAtom, (prev) => {
            return produce(prev, (draft) => {
              draft[key] = update
            })
          })
        },
      )
    }, [ctxAtom, key]),
  )

  return atomAccessor as any as [
    NonNullable<NoteModel[T]>,

    (update: NoteModel[T]) => NoteModel[T] | void,
  ]
}
