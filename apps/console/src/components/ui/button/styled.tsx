import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { flushSync } from 'react-dom'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { clsxm } from '~/lib/helper'
import { jotaiStore } from '~/lib/store'

import {
  ButtonGroupAtomContext,
  ButtonGroupContext,
} from './ButtonGroupContext'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-foreground-700/30 bg-background hover:bg-muted hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },

      group: {
        normal: '',
        left: 'border-r-0 rounded-r-none',
        right: 'rounded-l-none !ml-0',
        center: 'rounded-none !ml-0 !mr-0 border-r-0',
      },

      state: {
        loading: 'opacity-50 pointer-events-none',
        disabled: 'opacity-50 pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      group: 'normal',
    },
    compoundVariants: [
      // {
      //   group: 'center',
      //   variant: 'outline',
      //   className: '',
      // },
    ],
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean

  icon?: React.ReactNode | React.FC<{ className?: string }>
  isLoading?: boolean
}

export type ButtonVariant = VariantProps<typeof buttonVariants>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant: pVariant,
      size: pSize,
      asChild = false,
      icon,
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const ctx = React.useContext(ButtonGroupAtomContext)

    const id = React.useId()

    const [buttonPos, setButtonPos] = React.useState<null | number>(null)
    const [totalCount, setTotalCount] = React.useState(0)

    const buttonRef = React.useRef<HTMLButtonElement>(null)

    React.useImperativeHandle(ref, () => buttonRef.current!)

    const [isInButtonGroup, setIsInButtonGroup] = React.useState(false)

    React.useLayoutEffect(() => {
      const $button = buttonRef.current

      if (!$button) return

      let $parent = $button.parentElement
      let isInButtonGroup = false
      for (let i = 0; i < 3; i++) {
        if (!$parent) return

        if ($parent.dataset['buttonGroup']) {
          isInButtonGroup = true
          break
        }

        $parent = $parent.parentElement
      }
      flushSync(() => {
        setIsInButtonGroup(isInButtonGroup)
      })
      if (!isInButtonGroup) return

      if (!ctx) return
      const disposeList = [
        jotaiStore.sub(ctx.count, () => {
          setTotalCount(jotaiStore.get(ctx.count))
        }),
        jotaiStore.sub(ctx.ids, () => {
          setButtonPos(jotaiStore.get(ctx.ids).indexOf(id))
        }),
      ]
      jotaiStore.set(ctx.count, (c) => ++c)
      jotaiStore.set(ctx.ids, (ids) => [...ids, id])

      return () => {
        if (!ctx) return
        jotaiStore.set(ctx.count, (c) => --c)
        jotaiStore.set(ctx.ids, (ids) => ids.filter((i) => i !== id))
        disposeList.forEach((d) => d())
      }
    }, [ctx, id])

    const groupVariant = React.useMemo(() => {
      if (buttonPos === null) return 'normal'

      if (buttonPos === 0 && totalCount === 1) return 'normal'

      if (buttonPos === 0) return 'left'
      if (buttonPos === totalCount - 1) return 'right'
      return 'center'
    }, [buttonPos])

    const buttonCtx = React.useContext(ButtonGroupContext)
    const variant = isInButtonGroup ? buttonCtx?.variant ?? pVariant : pVariant
    const size = isInButtonGroup ? buttonCtx?.size ?? pSize : pSize

    return (
      <Comp
        className={clsxm(
          buttonVariants({
            variant,
            group: groupVariant,
            size,
            className,
            state: isLoading
              ? 'loading'
              : props.disabled
              ? 'disabled'
              : undefined,
          }),
        )}
        ref={buttonRef}
        {...props}
      >
        {icon && typeof icon === 'function'
          ? React.createElement(icon, {
              className: 'h-[1em] w-[1em]',
            })
          : icon}
        {isLoading && (
          <span className="absolute inset-0 flex center">
            <i className="loading-spinner" />
          </span>
        )}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
