import { useRef } from 'react'
import { useSetAtom, useStore } from 'jotai'
import { useEventCallback } from 'usehooks-ts'
import type { MilkdownRef } from '~/components/ui/Editor'

import { MilkdownEditor } from '~/components/ui/Editor'

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
  const textAtom = useBaseWritingContext().text!
  const setText = useSetAtom(textAtom)
  const store = useStore()
  const handleMarkdownChange = useEventCallback(setText)
  const milkdownRef = useRef<MilkdownRef>(null)
  return (
    <div className="border-default-200 rounded-medium focus-within:border-primary-400 relative h-0 flex-grow overflow-auto border p-3 duration-200">
      <MilkdownEditor
        ref={milkdownRef}
        onMarkdownChange={handleMarkdownChange}
        initialMarkdown={store.get(textAtom)}
      />
    </div>
  )
}
