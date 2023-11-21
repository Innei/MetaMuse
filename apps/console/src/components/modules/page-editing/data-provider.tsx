import { createModelDataProvider } from 'jojoo/react'
import { useContext, useMemo } from 'react'
import { produce } from 'immer'
import { atom, useAtom } from 'jotai'
import type { PageModel } from '~/models/page'

export const {
  useModelDataSelector: usePageModelDataSelector,
  useSetModelData: usePageModelSetModelData,
  useGetModelData: usePageModelGetModelData,

  ModelDataAtomProvider: PageModelDataAtomProvider,

  ModelDataAtomContext,
} = createModelDataProvider<PageModel>()

export const usePageModelSingleFieldAtom = (key: keyof PageModel) => {
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
