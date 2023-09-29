import React from 'react'
import { Drawer } from 'vaul'
import type { FC, PropsWithChildren } from 'react'

export interface PresentDrawerProps {
  content: JSX.Element | FC
}

export const PresentDrawer: FC<PropsWithChildren<PresentDrawerProps>> = (
  props,
) => {
  const { content, children } = props
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Content className="bg-background fixed bottom-0 left-0 right-0 z-[999] mt-24 flex flex-col rounded-t-[10px] p-4">
          <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-neutral-800" />

          {React.isValidElement(content)
            ? content
            : typeof content === 'function'
            ? React.createElement(content)
            : null}
        </Drawer.Content>
        <Drawer.Overlay className="bg-foreground/40 fixed inset-0 z-[998] backdrop-blur-sm" />
      </Drawer.Portal>
    </Drawer.Root>
  )
}
