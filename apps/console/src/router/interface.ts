export interface RouteMeta {
  title: string
  icon: React.ReactNode
  layout: React.ReactNode

  redirect?: string | (() => string)
}
