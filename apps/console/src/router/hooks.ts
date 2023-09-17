import { RouteObject, useLoaderData, useLocation } from 'react-router-dom'

import { routePath2RouteObjectMapping } from './builder'
import { RouteMeta } from './interface'

export const useRouteContext = () => {
  return useLoaderData() as RouteObject & {
    meta: RouteMeta
    parent?: RouteObject & { meta: RouteMeta }
  }
}

export const useCurrentRouteObject = () => {
  const location = useLocation()
  console.log(location.pathname)

  return routePath2RouteObjectMapping[location.pathname]
}
