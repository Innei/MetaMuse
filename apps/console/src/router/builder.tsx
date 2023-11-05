import React, {
  createElement,
  Fragment,
  Suspense,
  useLayoutEffect,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import type { RouteExtendObject, RouteMeta } from './interface'

const appPages = import.meta.glob('../pages/app/**/*.tsx') as any as Record<
  string,
  () => Promise<{ default: React.ComponentType<any> | RouteMeta }>
>

async function builder() {
  const fsPath2LazyComponentMapping = {} as {
    [fsPath: string]: {
      lazyComponent: React.ReactNode
      routePath: string
    }
  }

  const fsPath2MetaMapping = {} as {
    [fsPath: string]: () => Promise<{ default: RouteMeta }>
  }

  const globalOmitPaths = ['page.tsx', 'layout.tsx']

  for (const rawPath in appPages) {
    if (globalOmitPaths.some((omitPath) => rawPath === omitPath)) continue

    const path = rawPath.replace('../pages/app/', '')
    // dashboard/page.tsx
    // layout.tsx
    // posts/edit/page.tsx

    const tailingFileName = path.split('/').pop()

    switch (tailingFileName) {
      case 'page.tsx': {
        if (!(appPages[rawPath] instanceof Function)) {
          continue
        }
        fsPath2LazyComponentMapping[path] = {
          routePath: path.replace('/page.tsx', ''),
          lazyComponent: (
            <ErrorBoundary
              fallback={<p className="text-error">Path: {path} render error</p>}
            >
              {React.createElement(React.lazy(appPages[rawPath] as any))}
            </ErrorBoundary>
          ),
        }
        break
      }
      case 'meta.tsx': {
        // @ts-ignore
        fsPath2MetaMapping[path] = appPages[rawPath]
      }
    }
  }

  const appRoutes = [] as RouteExtendObject[]

  for (const fsPath in fsPath2LazyComponentMapping) {
    const { routePath, lazyComponent } = fsPath2LazyComponentMapping[fsPath]

    const isFirstLevelRoute = routePath.split('/').length === 1
    if (isFirstLevelRoute) {
      appRoutes.push({
        path: routePath,
        Component: () => (
          <Fragment>
            <Suspense>{lazyComponent}</Suspense>
          </Fragment>
        ),
        children: [],
        // loader: async () => routeObject,
      })
      continue
    }
    const parentRoutePath = routePath.split('/').slice(0, -1).join('/')

    let parentRoute = appRoutes.find((route) => route.path === parentRoutePath)

    if (!parentRoute) {
      parentRoute = {
        path: parentRoutePath,
        Component: () =>
          createElement(
            Fragment,
            null,
            <Suspense>
              <Outlet />
            </Suspense>,
          ),
        children: [],
        // loader: async () => parentRoute,
      }
      appRoutes.push(parentRoute)
    }

    if (!parentRoute.children) parentRoute.children = []

    const routeObject: RouteObject = {
      path: routePath.replace(`${parentRoutePath}/`, ''),
      Component: () => (
        <Fragment>
          <Suspense>{lazyComponent}</Suspense>
        </Fragment>
      ),
      children: [],
      // loader: async () => routeObject,
    }
    parentRoute!.children!.push(routeObject)
  }

  const routePath2RouteObjectMapping = {} as {
    [routePath: string]: RouteExtendObject
  }

  function dts(
    route: RouteObject & {
      parent?: RouteObject
    },
    parentRoute?: RouteObject,
  ) {
    route.parent = parentRoute
    const currentRoutePath = `/${route.path}` || '/'
    const parentRoutePath = parentRoute?.path?.replace(/\/$/, '') || ''
    const fullPath = parentRoute
      ? `${parentRoutePath ? `/${parentRoutePath}` : ''}${
          currentRoutePath.length > 0
            ? `/${currentRoutePath.replace(/^\//, '')}`
            : '/'
        }`
      : currentRoutePath
    routePath2RouteObjectMapping[fullPath] = route
    if (route.children) {
      route.children.forEach((childRoute) => dts(childRoute, route))
    }
  }

  appRoutes.forEach((route) => dts(route))

  for (const path of Object.keys(fsPath2MetaMapping)) {
    const meta = fsPath2MetaMapping[path]
    const module = await meta()
    const defaultExport = module.default
    let toRoutePath = path.replace('/meta.tsx', '')
    if (toRoutePath[0] !== '/') {
      toRoutePath = `/${toRoutePath}`
    }
    const route = routePath2RouteObjectMapping[toRoutePath]
    if (!route) {
      console.error(`Route not found: ${toRoutePath}`)
      continue
    }

    if (defaultExport.redirect) {
      delete route.element
      const memoedRedirect = defaultExport.redirect

      // NOTE 只做一级路由的重定向

      route.Component = function Component() {
        const navigate = useNavigate()

        const location = useLocation()

        useLayoutEffect(() => {
          if (`/${route.path}` !== location.pathname) return
          const redirectTo =
            typeof memoedRedirect === 'function'
              ? memoedRedirect()
              : memoedRedirect
          if (redirectTo === location.pathname) return
          navigate(redirectTo)
        }, [])
        return <Outlet />
      }
    }

    route.meta = defaultExport

    if (route.meta.priority) {
      ;(route.parent?.children as RouteExtendObject[])?.sort((b, a) => {
        return (b.meta?.priority || 0) - (a.meta?.priority || 0)
      })
    }
  }

  appRoutes.sort((bRouter, aRoute) => {
    return (bRouter.meta?.priority || 0) - (aRoute.meta?.priority || 0)
  })

  return {
    appRoutes,
    routePath2RouteObjectMapping,
  }
}

const { appRoutes, routePath2RouteObjectMapping } = await builder()

function flattenRoutes(routes: RouteExtendObject[], parentPath = '') {
  let result = [] as RouteExtendObject[]

  for (const route of routes) {
    const fullPath = `${parentPath}/${route.path}`
    result.push({
      ...route,
      index: false,
      path: fullPath,
      children: [], // Empty children array since we're flattening the structure
    })

    if (route.children && route.children.length > 0) {
      result = result.concat(flattenRoutes(route.children, fullPath))
    }
  }

  return result
}

const flattedRoutes = flattenRoutes(appRoutes)
export { appPages, appRoutes, routePath2RouteObjectMapping, flattedRoutes }
