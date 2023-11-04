import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { clsxm } from '~/lib/helper'

import { useLabelPropsContext } from './LabelContext'

const labelVariants = cva(
  'text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground-600',
)
export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => {
  const propsCtx = useLabelPropsContext()

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={clsxm(labelVariants(), className, propsCtx.className)}
      {...props}
    />
  )
})
Label.displayName = LabelPrimitive.Root.displayName
