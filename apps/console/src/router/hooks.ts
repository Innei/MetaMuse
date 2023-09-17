import { useLoaderData, useLocation } from 'react-router-dom'

import { routePath2RouteObjectMapping } from './builder'
import { RouteExtendObject } from './interface'

export const useRouteContext = () => {
  return useLoaderData() as RouteExtendObject
}

export const useCurrentRouteObject = () => {
  const location = useLocation()

  return routePath2RouteObjectMapping[location.pathname]
}
