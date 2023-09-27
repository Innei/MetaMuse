import { createContext, useContext, useMemo } from 'react'
import { produce } from 'immer'
import { atom, useStore } from 'jotai'
import { isString } from 'lodash-es'
import type { PrimitiveAtom } from 'jotai'
import type { PropsWithChildren } from 'react'

import { jotaiStore } from '~/lib/store'

type TBaseWritingContext = {
  title: PrimitiveAtom<string>
  slug?: PrimitiveAtom<string> | null
  categoryId?: PrimitiveAtom<string> | null
  text: PrimitiveAtom<string>
}
const BaseWritingContext = createContext<TBaseWritingContext>(null!)
type BaseModeType = {
  title: string
  slug?: string
  text: string
  categoryId?: string
}
export const BaseWritingProvider = <T extends BaseModeType>(
  props: { atom: PrimitiveAtom<T> } & PropsWithChildren,
) => {
  const { atom: _atom } = props
  const store = useStore()
  const ctxValue = useMemo<TBaseWritingContext>(
    () => ({
      title: buildCtxAtom(_atom, 'title'),
      // @ts-expect-error
      slug: isString(store.get(_atom).slug)
        ? buildCtxAtom(_atom, 'slug')
        : null,
      // @ts-expect-error
      categoryId: isString(store.get(_atom).categoryId)
        ? buildCtxAtom(_atom, 'categoryId')
        : null,
      text: buildCtxAtom(_atom, 'text'),
    }),
    [_atom, store],
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

const buildCtxAtom = <T extends BaseModeType, K extends keyof T>(
  _atom: PrimitiveAtom<T>,
  key: K,
) => {
  const ctxAtom = atom(
    (get) => get(_atom)[key],
    (get, set, newValue: any) => {
      set(_atom, (value) =>
        produce(value, (draft: any) => void (draft[key] = newValue)),
      )
    },
  ) as PrimitiveAtom<T[K]>

  ctxAtom.onMount = (setAtom) => {
    const handler = () => {
      console.log('handler')
      const newValue = jotaiStore.get(_atom)[key]
      setAtom(newValue)
    }
    const dispose = jotaiStore.sub(_atom, handler)

    return () => {
      dispose()
    }
  }
  return ctxAtom
}
