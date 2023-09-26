import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { produce } from 'immer'
import { atom, PrimitiveAtom } from 'jotai'

type TBaseWritingContext = {
  title: PrimitiveAtom<string>
  slug: PrimitiveAtom<string>
  text: PrimitiveAtom<string>
}
const BaseWritingContext = createContext<TBaseWritingContext>(null!)

export const BaseWritingProvider = <
  T extends { title: string; slug: string; text: string },
>(
  props: { atom: PrimitiveAtom<T> } & PropsWithChildren,
) => {
  const { atom: _atom } = props
  const ctxValue = useMemo<TBaseWritingContext>(
    () => ({
      title: buildCtxAtom(_atom, 'title'),
      slug: buildCtxAtom(_atom, 'slug'),
      text: buildCtxAtom(_atom, 'text'),
    }),
    [atom],
  )

  return (
    <BaseWritingContext.Provider value={ctxValue}>
      {props.children}
    </BaseWritingContext.Provider>
  )
}

export const useBaseWritingContext = () => {
  return useContext(BaseWritingContext)
}

const buildCtxAtom = <
  T extends {
    title: string
    slug: string
    text: string
  },
  K extends keyof T,
>(
  _atom: PrimitiveAtom<T>,
  key: K,
) => {
  return atom(
    (get) => get(_atom)[key],
    (get, set, newValue: any) => {
      set(_atom, (value) =>
        produce(value, (draft: any) => void (draft[key] = newValue)),
      )
    },
  ) as PrimitiveAtom<T[K]>
}
