import { createContext, useContext, useMemo } from 'react'
import { produce } from 'immer'
import { atom, useAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai'
import type { PropsWithChildren } from 'react'

const BaseWritingContext = createContext<PrimitiveAtom<BaseModelType>>(null!)

type BaseModelType = {
  title: string
  slug?: string
  text: string
  categoryId?: string
  subtitle?: string
}

export const BaseWritingProvider = <T extends BaseModelType>(
  props: { atom: PrimitiveAtom<T> } & PropsWithChildren,
) => {
  return (
    // @ts-ignore
    <BaseWritingContext.Provider value={props.atom}>
      {props.children}
    </BaseWritingContext.Provider>
  )
}

export const useBaseWritingContext = () => {
  return useContext(BaseWritingContext)
}

export const useBaseWritingAtom = (key: keyof BaseModelType) => {
  const ctxAtom = useBaseWritingContext()
  return useAtom(
    useMemo(
      () =>
        atom(
          (get) => get(ctxAtom)[key],
          (get, set, newValue) => {
            set(ctxAtom, (prev) => {
              return produce(prev, (draft) => {
                // @ts-ignore
                draft[key] = newValue
              })
            })
          },
        ),
      [ctxAtom, key],
    ),
  )
}
