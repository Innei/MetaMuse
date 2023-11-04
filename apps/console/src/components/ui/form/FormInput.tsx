import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useEventCallback } from 'usehooks-ts'
import type { ForwardRefComponent } from 'framer-motion'
import type { InputProps } from '../input'
import type { FormFieldBaseProps } from './types'

import { clsxm } from '~/lib/helper'

import { Input } from '../input'
import { Textarea } from '../textarea'
import { useFormConfig } from './FormContext'
import { useValidateInput } from './hooks'

export const FormInput: ForwardRefComponent<
  HTMLInputElement,
  InputProps &
    FormFieldBaseProps<string> & {
      textarea?: boolean
      emptyAsNull?: boolean
    }
> = forwardRef(
  (
    { className, rules: _rules, textarea, emptyAsNull = false, ...rest },
    ref,
  ) => {
    const [rules] = useState(() =>
      Array.isArray(_rules)
        ? _rules
        : typeof _rules === 'undefined'
        ? []
        : [_rules],
    )
    const { showErrorMessage } = useFormConfig()
    const inputRef = useRef<HTMLInputElement>(null)
    const { errorMessage, onKeyDown, onBlur } = useValidateInput({
      rules,
      name: rest.name,
      inputRef,
      emptyAsNull,
    })

    const handleKeyDown = useEventCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown()
        rest.onKeyDown?.(e)
      },
    )
    const handleBlur = useCallback(
      (e: any) => {
        onBlur()
        rest.onBlur?.(e)
      },
      [onBlur, rest],
    )
    useImperativeHandle(ref, () => inputRef.current!)
    const As = textarea ? Textarea : Input
    return (
      <As
        // @ts-ignore
        ref={inputRef}
        className={clsxm('w-full', className)}
        // @ts-expect-error
        onBlur={handleBlur}
        errorMessage={errorMessage}
        isInvalid={!!errorMessage && showErrorMessage}
        isRequired={rest.required}
        // @ts-expect-error
        onKeyDown={handleKeyDown}
        {...rest}
      />
    )
  },
)

FormInput.displayName = 'FormInput'
