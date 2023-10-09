import { Input, Textarea } from '@nextui-org/react'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useEventCallback } from 'usehooks-ts'
import type { InputProps } from '@nextui-org/react'
import type { ForwardRefComponent } from 'framer-motion'
import type { FormFieldBaseProps } from './types'

import { clsxm } from '~/lib/helper'

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
        ref={inputRef}
        className={clsxm('w-full', className)}
        size="sm"
        labelPlacement="outside"
        placeholder=" "
        isInvalid={!!errorMessage}
        onBlur={handleBlur}
        errorMessage={!!errorMessage && showErrorMessage && errorMessage}
        isRequired={rest.required}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    )
  },
)

FormInput.displayName = 'FormInput'
