import { FC, PropsWithChildren } from 'react'

declare global {
  export type Component<P = {}> = FC<ComponentType & P>

  export type ComponentType<P = {}> = {
    className?: string
  } & PropsWithChildren &
    P

  export interface Window {
    injectData: {
      BASE_API: null | string
      WEB_URL: null | string
      GATEWAY: null | string
      LOGIN_BG: null | string
      TITLE: null | string

      INIT: null | boolean
    }
  }
  // TODO should remove in next TypeScript version
  interface Document {
    startViewTransition(callback?: () => void | Promise<void>): ViewTransition
  }

  interface ViewTransition {
    finished: Promise<void>
    ready: Promise<void>
    updateCallbackDone: () => void
    skipTransition(): void
  }
}

declare module 'react' {
  export interface AriaAttributes {
    'data-testid'?: string
  }
}

export {}
