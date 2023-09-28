import { useEffect, useRef } from 'react'
import { produce } from 'immer'
import { atom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { useEventCallback } from 'usehooks-ts'
import type { MilkdownRef } from '~/components/ui/Editor'

import { MilkdownEditor } from '~/components/ui/Editor'
import { jotaiStore } from '~/lib/store'

import { SlugInput } from './__internal/SlugInput'
import { TitleInput } from './__internal/TitleInput'
import { useBaseWritingContext } from './provider'

export const Writing = () => {
  return (
    <>
      <TitleInput />
      <SlugInput />

      <Editor />
    </>
  )
}

const Editor = () => {
  const ctxAtom = useBaseWritingContext()
  const setAtom = useSetAtom(ctxAtom)
  const setText = useEventCallback((text: string) => {
    setAtom((prev) => {
      return produce(prev, (draft) => {
        draft.text = text
      })
    })
  })
  const store = useStore()
  const handleMarkdownChange = useEventCallback(setText)
  const milkdownRef = useRef<MilkdownRef>(null)

  useEffect(() => {
    jotaiStore.set(milkdownRefAtom, milkdownRef.current)
    return () => {
      jotaiStore.set(milkdownRefAtom, null)
    }
  }, [])
  return (
    <div className="border-default-200 rounded-medium focus-within:border-primary-400 relative h-0 flex-grow overflow-auto border p-3 duration-200">
      <MilkdownEditor
        ref={milkdownRef}
        onMarkdownChange={handleMarkdownChange}
        initialMarkdown={store.get(ctxAtom).text}
      />
    </div>
  )
}

const milkdownRefAtom = atom<MilkdownRef | null>(null)
export const useEditorRef = () => useAtomValue(milkdownRefAtom)
