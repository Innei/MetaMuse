import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'
import { AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import { merge, throttle } from 'lodash-es'
import { useEventCallback } from 'usehooks-ts'
import type { KeyboardEvent } from 'react'
import type { InputProps } from '../input'

import { stopPropagation } from '~/lib/dom'
import { clsxm } from '~/lib/helper'

import { Input } from '../input'
import { MotionDivToBottom } from '../motion'
import { RootPortal } from '../portal'

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

  portal?: boolean

  // classnames

  wrapperClassName?: string
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
      portal,
      wrapperClassName,

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
      const trimInputValue = (inputValue as string).trim()

      if (!trimInputValue) return setFilterableSuggestions(suggestions)

      const results = fuse.search(trimInputValue)
      setFilterableSuggestions(results.map((result) => result.item))
    })
    useEffect(() => {
      doFilter()
    }, [inputValue, suggestions])

    const [isOpen, setIsOpen] = useState(false)

    const ref = useRef<HTMLDivElement>(null)
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

    const [inputWidth, setInputWidth] = useState(0)
    const [inputPos, setInputPos] = useState(() => ({ x: 0, y: 0 }))

    useLayoutEffect(() => {
      const $input = inputRef.current
      if (!$input) return

      const handler = () => {
        const rect = $input.getBoundingClientRect()
        setInputWidth(rect.width)
        setInputPos({ x: rect.x, y: rect.y + rect.height + 6 })
      }
      handler()

      const resizeObserver = new ResizeObserver(handler)
      resizeObserver.observe($input)
      return () => {
        resizeObserver.disconnect()
      }
    }, [])

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

    const ListElement = (
      <MotionDivToBottom
        className={clsx(
          'border-1 border-default-200 z-[101] dark:border-default-100 bg-content1 mt-1 rounded-md pointer-events-auto',
          portal ? 'absolute  flex flex-col' : 'w-full absolute',
        )}
        ref={ref}
        style={merge(
          {},
          portal
            ? {
                width: `${inputWidth}px`,
                left: `${inputPos.x}px`,
                top: `${inputPos.y}px`,
              }
            : {},
        )}
      >
        {/* FIXME: https://github.com/radix-ui/primitives/issues/2125 */}
        <ul
          className="pointer-events-auto overflow-auto flex-grow max-h-48"
          onWheel={stopPropagation}
          onScroll={handleScroll}
        >
          {filterableSuggestions.map((suggestion) => {
            return (
              <li
                className="px-4 py-3 text-sm hover:bg-default-200 dark:hover:bg-default-100 cursor-default"
                key={suggestion.value}
                onClick={() => {
                  onSuggestionSelected(suggestion)
                  setIsOpen(false)

                  setInputValue(suggestion.name)
                }}
              >
                {renderSuggestion(suggestion)}
              </li>
            )
          })}
        </ul>
      </MotionDivToBottom>
    )

    return (
      <div className={clsxm('relative pointer-events-auto', wrapperClassName)}>
        <Input
          value={inputValue}
          ref={inputRef}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleInputKeyDown}
          onChange={handleChange}
          {...inputProps}
        />
        <AnimatePresence>
          {isOpen &&
            !!filterableSuggestions.length &&
            (portal ? <RootPortal>{ListElement}</RootPortal> : ListElement)}
        </AnimatePresence>
      </div>
    )
  },
)

Autocomplete.displayName = 'Autocomplete'
