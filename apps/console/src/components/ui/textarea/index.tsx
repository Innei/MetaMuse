import React, { useId } from 'react'
import clsx from 'clsx'

import { clsxm } from '~/lib/helper'

import { Label } from '../label'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  labelPlacement?: 'top' | 'left'

  textareaClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, labelPlacement = 'top', textareaClassName, ...props },
    ref,
  ) => {
    if (props.readOnly) {
      props.disabled = true
    }
    const id = useId()
    return (
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
            className={clsx('text-sm', {
              'mr-4': labelPlacement === 'left',
              'mb-2 ml-2 flex': labelPlacement === 'top',
            })}
            htmlFor={id}
          >
            {label}
          </Label>
        )}

        <textarea
          className={clsxm(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
            'read-only:bg-default-100',
            textareaClassName,
          )}
          id={id}
          ref={ref}
          {...props}
        />
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
