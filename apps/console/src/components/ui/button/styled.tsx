import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import type { VariantProps } from 'class-variance-authority'

import { clsxm } from '~/lib/helper'
import { jotaiStore } from '~/lib/store'

import { Tooltip } from '../tooltip'
import {
  ButtonGroupAtomContext,
  ButtonGroupContext,
} from './ButtonGroupContext'

const buttonVariants = cva(
  clsx(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    'relative space-x-2',
  ),
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-foreground-700/30 bg-background hover:bg-muted text-foreground',

        ghost: 'hover:bg-foreground-700/10 !text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        text: 'p-2',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-8 rounded-md px-2 text-xs',
        sm: 'h-9 rounded-md px-3 text-sm',
        lg: 'h-11 rounded-md px-8 text-lg',
        icon: 'h-10 w-10',
      },

      color: {
        primary: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
        secondary: 'text-primary-foreground',
        accent: 'text-primary-foreground',
        muted: 'text-foreground',
      },
      group: {
        normal: '',
        left: '!border-r-0 !rounded-r-none',
        right: '!rounded-l-none !ml-0',
        center: '!rounded-none !ml-0 !mr-0 !border-r-0',
      },

      state: {
        loading: 'opacity-50 pointer-events-none',
        disabled: 'opacity-50 pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      color: 'primary',
      group: 'normal',
    },
    compoundVariants: [
      {
        color: 'primary',
        variant: 'default',
        className: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },

      {
        color: 'secondary',
        variant: 'default',
        className: 'bg-secondary text-primary-foreground hover:bg-secondary/90',
      },

      {
        color: 'accent',
        variant: 'default',
        className: 'bg-accent text-primary-foreground hover:bg-accent/90',
      },
      {
        color: 'destructive',
        variant: 'default',
        className: 'bg-red-500 text-primary-foreground hover:bg-red-500/90',
      },
      {
        color: 'muted',
        variant: 'default',
        className:
          'bg-foreground-300 text-foreground hover:bg-foreground-300/90',
      },

      {
        color: 'destructive',
        variant: 'text',
        className: 'text-red-500 hover:text-red-500/90',
      },

      {
        color: 'primary',
        variant: 'text',
        className: 'text-primary hover:text-primary/90',
      },
      {
        color: 'secondary',
        variant: 'text',
        className: 'text-secondary hover:text-secondary/90',
      },

      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary text-primary',
      },
      {
        variant: 'outline',
        color: 'accent',
        className: 'border-accent text-accent',
      },

      {
        variant: 'outline',
        color: 'secondary',
        className: 'border-secondary text-secondborder-secondary',
      },
      {
        variant: 'outline',
        color: 'destructive',
        className: 'border-destructive text-destructive',
      },
      {
        variant: 'outline',
        color: 'muted',
        className: 'border-current text-foreground-400',
      },

      {
        variant: 'ghost',
        color: 'muted',
        className: 'text-foreground-400',
      },

      // {
      //   group: 'center',
      //   variant: 'outline',
      //   className: '',
      // },
    ],
  },
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean

  icon?: React.ReactNode | React.FC<{ className?: string }>
  isLoading?: boolean

  rounded?: boolean
  iconOnly?: boolean

  tooltip?: string
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
      color,
      rounded,
      iconOnly,
      tooltip,
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

      setIsInButtonGroup(isInButtonGroup)

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

    const ButtonElement = (
      <Comp
        className={clsxm(
          buttonVariants({
            variant,
            group: groupVariant,
            size: iconOnly ? 'icon' : size,
            className: clsxm(
              rounded && 'rounded-full',
              // icon && 'inline-flex items-center',
              className,
            ),
            color,
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
        {icon && (
          <span className="mr-2 flex items-center">
            {typeof icon === 'function'
              ? React.createElement(icon, {
                  className: 'h-[1em] w-[1em]',
                })
              : icon}
          </span>
        )}
        {isLoading && (
          <span className="absolute inset-0 flex center">
            <i className="loading-spinner" />
          </span>
        )}

        {children}
      </Comp>
    )

    return tooltip ? (
      <Tooltip tip={tooltip}>{ButtonElement}</Tooltip>
    ) : (
      ButtonElement
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
