import { RouteObject } from 'react-router-dom'

export interface RouteMeta {
  title: string
  icon: React.ReactNode
  layout?: React.ReactNode

  redirect?: string | (() => string)
  priority?: number
}

export type RouteExtendObject = RouteObject & {
  meta?: RouteMeta
  parent?: RouteExtendObject
}
