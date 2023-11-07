import React, { useEffect, useMemo, useState } from 'react'
import { atom, useStore } from 'jotai'
import { Drawer } from 'vaul'
import type { FC, PropsWithChildren } from 'react'

import { clsxm } from '~/lib/helper'

export interface PresentDrawerProps {
  content: JSX.Element | FC
  open?: boolean
  onOpenChange?: (value: boolean) => void
  title?: string
  zIndex?: number
  dismissible?: boolean

  fullScreen?: boolean | 'half'
}

export const drawerStackAtom = atom([] as HTMLDivElement[])

export const PresentDrawer: FC<PropsWithChildren<PresentDrawerProps>> = (
  props,
) => {
  const {
    content,
    children,
    zIndex = 998,
    title,
    dismissible = true,
    fullScreen,
  } = props
  const nextRootProps = useMemo(() => {
    const nextProps = {} as any
    if (props.open !== undefined) {
      nextProps.open = props.open
    }

    if (props.onOpenChange !== undefined) {
      nextProps.onOpenChange = props.onOpenChange
    }

    return nextProps
  }, [props])
  const [holderRef, setHolderRef] = useState<HTMLDivElement | null>()
  const store = useStore()

  useEffect(() => {
    const holder = holderRef
    if (!holder) return
    store.set(drawerStackAtom, (p) => {
      return p.concat(holder)
    })

    return () => {
      store.set(drawerStackAtom, (p) => {
        return p.filter((item) => item !== holder)
      })
    }
  }, [holderRef, store])

  const Root = Drawer.Root

  const overlayZIndex = zIndex - 1
  const contentZIndex = zIndex

  return (
    <Root shouldScaleBackground dismissible={dismissible} {...nextRootProps}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Content
          style={{
            zIndex: contentZIndex,
          }}
          className={clsxm(
            'bg-background fixed bottom-0 left-0 right-0 mt-24 flex flex-col rounded-t-[10px] p-4 max-h-[95vh] pb-safe-or-4',
            fullScreen === true && 'h-[95vh] overflow-auto',
            fullScreen === 'half' && 'h-[50vh] overflow-auto',
          )}
        >
          {dismissible && (
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-neutral-800" />
          )}

          {title && <Drawer.Title>{title}</Drawer.Title>}

          <div className="relative w-full h-full">
            {React.isValidElement(content)
              ? content
              : typeof content === 'function'
              ? React.createElement(content)
              : null}
          </div>
          <div ref={setHolderRef} />
        </Drawer.Content>
        <Drawer.Overlay
          className="bg-foreground/40 fixed inset-0 backdrop-blur-sm"
          style={{
            zIndex: overlayZIndex,
          }}
        />
      </Drawer.Portal>
    </Root>
  )
}
