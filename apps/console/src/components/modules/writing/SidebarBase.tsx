import { ScrollShadow } from '@nextui-org/react'
import type { PropsWithChildren } from 'react'

export const SidebarWrapper = (props: PropsWithChildren) => {
  return (
    <ScrollShadow className="text-tiny scrollbar-none md:max-h-auto flex max-h-[calc(100vh-6rem)] flex-grow flex-col gap-8 overflow-auto pb-4 font-medium md:h-0">
      {props.children}
    </ScrollShadow>
  )
}
