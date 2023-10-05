import { useRef } from 'react'

export const useBeforeMounted = (callback: () => void) => {
  const onceRef = useRef(true)
  if (onceRef.current) {
    onceRef.current = false
    callback()
  }
}
