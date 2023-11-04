import React, { useId } from 'react'
import clsx from 'clsx'

import { clsxm } from '~/lib/helper'

import { Label } from '../label'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelPlacement?: 'top' | 'left' | 'inside'
  inputClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      labelPlacement = 'top',
      inputClassName,
      ...inputProps
    },
    ref,
  ) => {
    const id = useId()

    const { value, onChange, onBlur, onFocus, ...rest } = inputProps

    const [isFocused, setIsFocused] = React.useState(false)
    const handleFocus = React.useCallback(() => {
      setIsFocused(true)
    }, [])
    const handleBlur = React.useCallback(() => {
      setIsFocused(false)
    }, [])

    const [inputValue, setValue] = React.useState(inputProps.value)
    return (
      <div
        className={clsxm(
          {
            'flex flex-col': labelPlacement === 'top',
            'flex-row items-center': labelPlacement === 'left',
            relative: labelPlacement === 'inside',
          },
          'peer',
          className,
        )}
      >
        {label && (
          <Label
            className={clsx(
              'text-sm',
              {
                'mr-4': labelPlacement === 'left',
                'mb-2 ml-2 flex': labelPlacement === 'top',
              },
              labelPlacement === 'inside' && {
                'absolute top-2 left-3 duration-200 select-none': true,
                'text-primary': isFocused,
                'text-lg top-2 bottom-2 flex items-center':
                  !value && !isFocused,
              },
            )}
            htmlFor={id}
          >
            {label}
          </Label>
        )}
        <input
          id={id}
          value={inputValue}
          onChange={(e) => {
            setValue(e.target.value)
            onChange?.(e)
          }}
          onBlur={(e) => {
            handleBlur()
            onBlur?.(e)
          }}
          onFocus={(e) => {
            handleFocus()
            onFocus?.(e)
          }}
          type={type}
          className={clsxm(
            'flex h-10 w-full rounded-md border border-default-200 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
            labelPlacement === 'inside' && 'pt-8 pb-2 h-auto',
            inputClassName,
          )}
          ref={ref}
          {...rest}
        />
      </div>
    )
  },
)
Input.displayName = 'Input'
