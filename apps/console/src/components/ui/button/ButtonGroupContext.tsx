import { createContext } from 'react'
import { atom } from 'jotai'
import type { ButtonVariant } from './styled'

export const ButtonGroupContext = createContext<ButtonVariant>({})
export const ButtonGroupAtomContext = createContext<
  ReturnType<typeof createButtonGroupAtomContext>
>(null!)

export const createButtonGroupAtomContext = () => {
  return {
    count: atom(0),
    ids: atom<string[]>([]),
  }
}
