import * as SwitchPrimitives from '@radix-ui/react-switch'
import * as React from 'react'

import { clsxm } from '~/lib/helper'

import { Label } from '../label/Label'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={clsxm(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-default-300',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={clsxm(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export const LabelSwitch: Component<{
  label?: string

  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /**
   * Label placement
   */
  placement?: 'left' | 'right'
}> = (props) => {
  const {
    label,
    checked,
    onCheckedChange,
    placement = 'left',
    className,
    children,
  } = props
  const id = React.useId()
  const labelEl = <Label htmlFor={id}>{children ?? label}</Label>
  return (
    <div
      className={clsxm(
        'flex items-center justify-between space-x-2 text-[1em]',
        className,
      )}
    >
      {placement === 'left' ? labelEl : null}
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      {placement === 'right' ? labelEl : null}
    </div>
  )
}
