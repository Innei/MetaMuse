import { useLocation } from 'react-router-dom'

import { routePath2RouteObjectMapping } from './builder'

// export const useRouteContext = () => {
//   return useLoaderData() as RouteExtendObject
// }

export const useCurrentRouteObject = () => {
  const location = useLocation()

  return routePath2RouteObjectMapping[location.pathname]
}
