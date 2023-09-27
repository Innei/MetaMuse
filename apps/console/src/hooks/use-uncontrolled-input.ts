import { useRef } from 'react'

export const useUncontrolledInput = <
  T extends { value: string } = HTMLInputElement,
>() => {
  const ref = useRef<T>(null)
  return [ref.current?.value, () => ref.current?.value, ref] as const
}
