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

export const useNoteModelSingleFieldAtom = (key: keyof NoteModel) => {
  const ctxAtom = useContext(ModelDataAtomContext)
  return useAtom(
    useMemo(() => {
      return atom(
        (get) => {
          const data = get(ctxAtom)
          return data?.[key]
        },
        (get, set, update: any) => {
          set(ctxAtom, (prev) => {
            return produce(prev, (draft) => {
              draft[key as any] = update
            })
          })
        },
      )
    }, [ctxAtom, key]),
  )
}
