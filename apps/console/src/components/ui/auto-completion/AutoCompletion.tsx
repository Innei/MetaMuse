import { Input, Listbox, ListboxItem } from '@nextui-org/react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { throttle } from 'lodash-es'
import { useEventCallback } from 'usehooks-ts'
import type { InputProps } from '@nextui-org/react'
import type { KeyboardEvent } from 'react'

import { MotionDivToBottom } from '../motion'

export type Suggestion = {
  name: string
  value: string
}
export interface AutocompleteProps extends InputProps {
  suggestions: Suggestion[]
  renderSuggestion?: (suggestion: Suggestion) => any

  onSuggestionSelected: (suggestion: Suggestion) => void
  onConfirm?: (value: string) => void
  onEndReached?: () => void
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      suggestions,
      renderSuggestion = (suggestion) => suggestion.name,
      onSuggestionSelected,
      onConfirm,
      onEndReached,
      onChange,
      ...inputProps
    },
    forwardedRef,
  ) => {
    const [filterableSuggestions, setFilterableSuggestions] =
      useState(suggestions)
    const [inputValue, setInputValue] = useState(inputProps.value || '')

    const doFilter = useEventCallback(() => {
      const fuse = new Fuse(suggestions, {
        keys: ['name', 'value'],
      })
      const trimInputValue = inputValue.trim()

      if (!trimInputValue) return setFilterableSuggestions(suggestions)

      const results = fuse.search(trimInputValue)
      setFilterableSuggestions(results.map((result) => result.item))
    })
    useEffect(() => {
      doFilter()
    }, [inputValue, suggestions])

    const [isOpen, setIsOpen] = useState(false)

    const ref = useRef<HTMLElement>(null)
    const onBlur = useEventCallback((e: any) => {
      if (ref?.current?.contains(e.relatedTarget)) {
        return
      }
      setIsOpen(false)
    })

    const handleInputKeyDown = useEventCallback((e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm?.((e.target as HTMLInputElement).value)
        setIsOpen(false)
      }
    })
    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => inputRef.current!)

    const handleScroll = useEventCallback(
      throttle(() => {
        const { scrollHeight, scrollTop, clientHeight } = ref.current!
        // gap 50px
        if (scrollHeight - scrollTop - clientHeight < 50) {
          onEndReached?.()
        }
      }, 30),
    )

    const handleChange = useEventCallback((e: any) => {
      setInputValue(e.target.value)
      onChange?.(e)
    })

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleInputKeyDown}
          onChange={handleChange}
          {...inputProps}
        />
        <AnimatePresence>
          {isOpen && !!filterableSuggestions.length && (
            <Listbox
              as={MotionDivToBottom}
              ref={ref}
              className="border-1 border-default-200 dark:border-default-100 bg-content1 absolute z-50 mt-1 max-h-48 overflow-auto rounded-xl"
              onScroll={handleScroll}
            >
              {filterableSuggestions.map((suggestion) => {
                return (
                  <ListboxItem
                    key={suggestion.value}
                    onClick={() => {
                      onSuggestionSelected(suggestion)
                      setIsOpen(false)
                      if (inputRef.current)
                        inputRef.current.value = suggestion.name
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
