import type { useI18n } from '~/i18n/hooks'
import type { RouteObject } from 'react-router-dom'

export interface RouteMeta {
  title: string | ((t: ReturnType<typeof useI18n>) => string)
  icon: React.ReactNode
  layout?: React.ReactNode

  redirect?: string | (() => string)
  priority?: number
}

export type RouteExtendObject = RouteObject & {
  meta?: RouteMeta
  parent?: RouteExtendObject
}
