import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { atom, useAtom, useSetAtom } from 'jotai'
import type { FC } from 'react'
import type { Suggestion } from '../auto-completion'

import { CloseIcon } from '~/components/icons'
import { clsxm } from '~/lib/helper'

import { Autocomplete } from '../auto-completion'
import { MotionButtonBase } from '../button'

export interface TagProps {
  canClose?: boolean
  onClose?: () => void
}

export const Tag: Component<TagProps> = ({
  className,
  children,
  canClose,
  onClose,
}) => {
  return (
    <div
      className={clsxm(
        'border rounded-full border-foreground-400/80 px-2 py-1',
        'inline-flex items-center gap-2 relative',
        canClose && 'pr-1',
        className,
      )}
    >
      <span>{children}</span>
      {canClose && (
        <MotionButtonBase type="button" className="w-4 h-4" onClick={onClose}>
          <CloseIcon />
        </MotionButtonBase>
      )}
    </div>
  )
}
const createTagEditingContextValue = () => ({
  isEditing: atom(false),
})
const TagEditingContext = createContext<
  ReturnType<typeof createTagEditingContextValue>
>(null!)

export const AddTag: Component<TagCompletionProp> = ({ ...props }) => {
  const ctxValue = useMemo(createTagEditingContextValue, [])
  const [isEditing, setIsEditing] = useAtom(ctxValue.isEditing)
  return (
    <TagEditingContext.Provider value={ctxValue}>
      <div
        className={clsxm(
          'border-foreground-400/80 rounded-full border border-dashed h-6 w-6 flex items-center justify-center',
          isEditing && 'hidden',
        )}
        onClick={() => {
          setIsEditing(true)
        }}
      >
        <i className="icon-[mingcute--add-line] h-3 w-3" />
      </div>
      {isEditing && <TagCompletion {...props} />}
    </TagEditingContext.Provider>
  )
}

interface TagCompletionProp {
  onSelected?: (suggestion: Suggestion) => void
  onEnter?: (value: string) => void
  existsTags?: {
    id: string
  }[]
  allTags?: {
    id: string
    name: string
  }[]
}

const TagCompletion: FC<TagCompletionProp> = (props) => {
  const { allTags, existsTags, onEnter, onSelected } = props
  const { isEditing } = useContext(TagEditingContext)
  const setIsEditing = useSetAtom(isEditing)
  const filteredSuggestions = useMemo<Suggestion[]>(() => {
    if (!allTags || !existsTags) return []

    const currentTagIds = existsTags.map((t) => t.id)

    const tagIdSet = new Set(currentTagIds)
    return allTags
      .filter((t) => !tagIdSet.has(t.id))
      .map((tag) => ({
        value: tag.id,
        name: tag.name,
      }))
  }, [allTags, existsTags])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <Autocomplete
      ref={inputRef}
      inputClassName="h-8"
      onSuggestionSelected={(suggestion) => {
        onSelected?.(suggestion)
        setIsEditing(false)
      }}
      suggestions={filteredSuggestions}
      onConfirm={async (value) => {
        onEnter?.(value)
        setIsEditing(false)
      }}
    />
  )
}
