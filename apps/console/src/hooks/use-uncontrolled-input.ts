import { useRef } from 'react'

export const useUncontrolledInput = <T>(initialValue: T) => {
  const ref = useRef<HTMLInputElement>(null)
  return [ref.current?.value, () => ref.current?.value, ref] as const
}
