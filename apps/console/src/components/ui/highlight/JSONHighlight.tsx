import { useEffect, useRef } from 'react'
import type { FC } from 'react'

export const JSONHighlight: FC<{ code: string }> = (props) => {
  const ref = useRef<HTMLPreElement>(null)
  const code = props.code
  useEffect(() => {
    const $pre = ref.current
    if (!$pre) return
    let isMounted = true
    import('monaco-editor').then(function render(mo) {
      mo.editor.setTheme('dark')
      if (!isMounted) return
      mo.editor.colorize(code, 'json', { tabSize: 2 }).then(($dom) => {
        $pre.innerHTML = $dom
      })
    })
    return () => {
      isMounted = false
    }
  }, [code])
  return (
    <pre
      ref={ref}
      className="bg-neutral-800 rounded-md p-4 whitespace-pre overflow-auto text-zinc-100"
    />
  )
}
