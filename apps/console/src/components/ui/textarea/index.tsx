import React, { useId } from 'react'
import clsx from 'clsx'

import { clsxm } from '~/lib/helper'

import { ErrorLabelLine } from '../label'
import { Label } from '../label/Label'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  labelPlacement?: 'top' | 'left'

  textareaClassName?: string

  errorMessage?: string
  isInvalid?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      labelPlacement = 'top',
      textareaClassName,
      errorMessage,
      isInvalid,
      ...props
    },
    ref,
  ) => {
    if (props.readOnly) {
      props.disabled = true
    }
    const id = useId()
    return (
      <div className="flex flex-col">
        <div
          className={clsxm(
            {
              'flex flex-col': labelPlacement === 'top',
              'flex-row items-center': labelPlacement === 'left',
            },
            'peer',
            className,
          )}
        >
          {label && (
            <Label
              className={clsx('text-xs', {
                'mr-4': labelPlacement === 'left',
                'mb-2 flex': labelPlacement === 'top',
              })}
              htmlFor={id}
            >
              {label}
            </Label>
          )}

          <textarea
            className={clsxm(
              'flex min-h-[80px] w-full rounded-md border border-default-200 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
              'read-only:bg-default-100',
              isInvalid && '!border-error !bg-error/10',
              textareaClassName,
            )}
            id={id}
            ref={ref}
            {...props}
          />
        </div>

        {isInvalid && errorMessage && (
          <ErrorLabelLine id={id} errorMessage={errorMessage} />
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
