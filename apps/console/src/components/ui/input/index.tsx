import React, { createContext, useContext, useEffect, useId } from 'react'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import { merge } from 'lodash-es'
import type { ContextType, FC, PropsWithChildren } from 'react'

import { clsxm } from '~/lib/helper'

import { MotionButtonBase } from '../button'
import { ErrorLabelLine } from '../label'
import { Label } from '../label/Label'

const InputPropsContext = createContext<
  Pick<InputProps, 'labelPlacement' | 'inputClassName' | 'labelClassName'>
>({})

const useInputPropsContext = () => useContext(InputPropsContext)

export const InputProvider: FC<
  ContextType<typeof InputPropsContext> & PropsWithChildren
> = ({ children, ...props }) => {
  return (
    <InputPropsContext.Provider value={props}>
      {children}
    </InputPropsContext.Provider>
  )
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelPlacement?: 'top' | 'left' | 'inside'
  labelClassName?: string
  inputClassName?: string
  isLoading?: boolean
  endContent?: React.ReactNode

  errorMessage?: string
  isInvalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      className,
      type,
      label,

      isLoading,
      errorMessage,
      isInvalid,
      endContent,

      labelPlacement: _,
      inputClassName: __,

      ...inputProps
    } = props
    const id = useId()

    const ctxProps = useInputPropsContext()

    const { value, onChange, onBlur, onFocus, ...rest } = inputProps

    const [isFocused, setIsFocused] = React.useState(false)
    const handleFocus = React.useCallback(() => {
      setIsFocused(true)
    }, [])
    const handleBlur = React.useCallback(() => {
      setIsFocused(false)
    }, [])

    const [inputValue, setValue] = React.useState(inputProps.value)

    useEffect(() => {
      setValue(inputProps.value)
    }, [inputProps.value])

    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

    const mergedProps = merge({}, ctxProps, props)
    const { labelPlacement = 'top' } = mergedProps

    const labelClassName = clsxm(ctxProps.inputClassName, props.inputClassName)
    const inputClassName = clsxm(ctxProps.inputClassName, props.inputClassName)

    return (
      <div className="flex flex-col w-full">
        <div
          className={clsxm(
            {
              'flex flex-col': labelPlacement === 'top',
              'flex-row flex-grow flex items-center': labelPlacement === 'left',
            },
            'peer relative',
            className,
          )}
        >
          {label && (
            <Label
              className={clsx(
                'text-xs',
                {
                  'mr-4': labelPlacement === 'left',
                  'mb-2 flex': labelPlacement === 'top',
                },
                labelPlacement === 'inside' && {
                  'absolute top-2 left-3 duration-200 select-none z-[1]': true,
                  'text-primary': isFocused,
                  'text-lg top-2 bottom-2 flex items-center':
                    !value && !isFocused,
                },
                labelClassName,
              )}
              htmlFor={id}
            >
              {label}
            </Label>
          )}
          <div className="relative flex-grow">
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
              type={
                type === 'password' && !isPasswordVisible ? 'password' : 'text'
              }
              className={clsxm(
                'flex h-10 w-full rounded-md border border-default-200 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
                labelPlacement === 'inside' && 'pt-8 pb-2 h-auto',
                type === 'password' && [
                  'pr-6',
                  !isPasswordVisible && 'font-mono',
                ],
                isLoading && 'pr-6',
                isInvalid && '!border-error !bg-error/10',

                inputClassName,
              )}
              ref={ref}
              {...rest}
            />
            {type === 'password' && !isLoading && (
              <MotionButtonBase
                className={rightContentVariants({
                  placement: labelPlacement,
                })}
                onClick={() => {
                  setIsPasswordVisible(!isPasswordVisible)
                }}
              >
                <i
                  className={clsx(
                    'text-default-500 text-lg',

                    isPasswordVisible
                      ? 'icon-[mingcute--eye-line]'
                      : 'icon-[mingcute--eye-close-line]',
                  )}
                />
              </MotionButtonBase>
            )}

            {!isLoading && endContent && (
              <div
                className={rightContentVariants({
                  placement: labelPlacement,
                })}
              >
                {endContent}
              </div>
            )}

            {isLoading && (
              <div
                className={rightContentVariants({
                  placement: labelPlacement,
                })}
              >
                <i className="loading loading-spinner h-5 w-5 text-primary/80" />
              </div>
            )}
          </div>
        </div>
        {isInvalid && errorMessage && (
          <ErrorLabelLine id={id} errorMessage={errorMessage} />
        )}
      </div>
    )
  },
)

const rightContentVariants = cva('absolute right-2', {
  variants: {
    placement: {
      inside: 'bottom-2',
      left: 'bottom-0 top-0 flex items-center',
      top: 'bottom-0 top-0 flex items-center',
    },
  },
})

Input.displayName = 'Input'
