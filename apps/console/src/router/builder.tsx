import React, { createElement, Fragment, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, redirect, RouteObject } from 'react-router-dom'

import { RouteMeta } from './interface'

const appPages = import.meta.glob('../pages/app/**/*.tsx') as any as Record<
  string,
  () => Promise<{ default: React.ComponentType<any> | RouteMeta }>
>

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
            fallback={<p className="text-red-500">Path: {path} render error</p>}
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

const appRoutes = [] as RouteObject[]

for (const fsPath in fsPath2LazyComponentMapping) {
  const { routePath, lazyComponent } = fsPath2LazyComponentMapping[fsPath]

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
      loader: async () => parentRoute,
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
    loader: async () => routeObject,
  }
  parentRoute!.children!.push(routeObject)
}

const routePath2RouteObjectMapping = {} as {
  [routePath: string]: RouteObject & { meta?: RouteMeta; parent?: RouteObject }
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
    ? `${
        parentRoutePath ? `/${parentRoutePath}/` : ''
      }${currentRoutePath.replace(/^\//, '')}`
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
    const redirectFn = defaultExport.redirect

    const originalRouteLoader = route.loader
    route.loader = (ctx) => {
      if (originalRouteLoader) {
        return originalRouteLoader(ctx)
      }
      return redirectFn instanceof Function
        ? redirectFn()
        : redirect(redirectFn)
    }
  }

  route.meta = defaultExport
}

export { appPages, appRoutes, routePath2RouteObjectMapping }
