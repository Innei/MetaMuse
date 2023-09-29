import { Input, Listbox, ListboxItem } from '@nextui-org/react'
import { forwardRef, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { InputProps } from '@nextui-org/react'
import type { KeyboardEvent } from 'react'

import { MotionDivToBottom } from '../motion'

export type Suggestion = {
  name: string
  value: string
}
export interface AutocompleteProps {
  inputProps?: InputProps
  suggestions: Suggestion[]
  renderSuggestion?: (suggestion: Suggestion) => any
  onSuggestionSelected: (suggestion: Suggestion) => void
  onConfirm?: (value: string) => void
}
export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      inputProps,
      suggestions,
      renderSuggestion = (suggestion) => suggestion.name,
      onSuggestionSelected,
      onConfirm,
    },
    inputRef,
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    const ref = useRef<HTMLElement>(null)
    const onBlur = (e) => {
      if (ref?.current?.contains(e.relatedTarget)) {
        return
      }
      setIsOpen(false)
    }

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onConfirm?.((e.target as HTMLInputElement).value)
            }
          }}
          {...inputProps}
        />
        <AnimatePresence>
          {isOpen && !!suggestions.length && (
            <Listbox
              as={MotionDivToBottom}
              ref={ref}
              className="border-1 border-default-200 dark:border-default-100 absolute z-50 mt-1 max-h-48 overflow-auto rounded-xl"
            >
              {suggestions.map((suggestion) => {
                return (
                  <ListboxItem
                    key={suggestion.value}
                    onClick={() => {
                      onSuggestionSelected(suggestion)
                      setIsOpen(false)
                    }}
                  >
                    {renderSuggestion(suggestion)}
                  </ListboxItem>
                )
              })}
            </Listbox>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

Autocomplete.displayName = 'Autocomplete'
