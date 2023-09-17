import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

import { BreadcrumbDivider } from '~/components/icons'
import { useAppInitialData } from '~/providers/initial'
import { appRoutes } from '~/router/builder'
import { useCurrentRouteObject } from '~/router/hooks'
import { RouteExtendObject } from '~/router/interface'

export const LayoutHeader = () => {
  const { seo } = useAppInitialData()
  return (
    <header className="border-b-[0.5px] border-zinc-200 bg-white/80 px-6 backdrop-blur dark:border-neutral-900 dark:bg-zinc-900/80">
      <nav className="flex h-16 items-center">
        <div className="flex items-center space-x-3">
          <button className="p-2 text-2xl">𝕄</button>
          <BreadcrumbDivider className={'opacity-20'} />
          <span className="font-bold opacity-90">{seo.title}</span>
          <BreadcrumbDivider className={'opacity-20'} />
        </div>

        <HeaderMenu />
      </nav>
      <SecondaryNavLine />
    </header>
  )
}

const HeaderMenu = () => {
  const firstLevelMenu = appRoutes
    .map((route) => {
      const title = route.meta?.title
      if (!title) return null

      return {
        title,
        path: route.path,
        icon: route.meta?.icon,
      }
    })
    .filter(Boolean) as { title: string; path: string; icon?: ReactNode }[]

  const routeObject = useCurrentRouteObject()
  // const pathname = useLocation().pathname

  return (
    <ul className="ml-2 flex items-center space-x-2 text-sm">
      {firstLevelMenu.map((menu) => {
        const isActive =
          menu.path === routeObject.path ||
          (routeObject.parent
            ? menu.path.startsWith(routeObject.parent.path!)
            : false)
        return (
          <li key={menu.path}>
            <Link
              to={`/${menu.path}`}
              className={clsx(
                'flex items-center space-x-1 rounded-md p-2 duration-200 hover:bg-slate-100 hover:dark:bg-neutral-700',
                isActive ? 'bg-slate-200 dark:bg-zinc-800' : '',
              )}
            >
              {menu.icon}
              <span>{menu.title}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

const SecondaryNavLine = () => {
  return (
    <nav className="flex h-12 items-center justify-between">
      <SecondaryLevelMenu />

      <div className="hidden flex-shrink-0 text-xs lg:flex">
        <Breadcrumb />
      </div>
    </nav>
  )
}

const SecondaryLevelMenu = () => {
  const routeObject = useCurrentRouteObject()
  const parent = routeObject.parent

  if (!parent) return null
  if (!parent.children?.length) return null

  return (
    <ul className="flex w-full space-x-4 text-sm">
      {(parent.children as RouteExtendObject[]).map((route) => {
        const fullPath = `${parent.path}/${route.path!}`

        const isActive = route === routeObject

        return (
          <li key={route.path}>
            <Link
              to={`/${fullPath}`}
              className={clsx(
                'flex items-center space-x-1 rounded-md px-2 py-1 duration-200 hover:bg-slate-100 hover:dark:bg-neutral-700',

                isActive ? 'bg-slate-200 dark:bg-zinc-800' : '',
              )}
            >
              {route.meta?.icon}
              <span>{route.meta?.title}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

const Breadcrumb = () => {
  const routeObject = useCurrentRouteObject()

  const routes = [routeObject]
  let parent = routeObject.parent
  while (parent) {
    routes.unshift(parent)
    parent = parent.parent
  }

  return (
    <>
      {routes.map((route, index) => {
        const isLast = index === routes.length - 1

        return (
          <span key={route.path} className={clsx('flex items-center py-1')}>
            <span>{route.meta?.title}</span>
            {!isLast && <BreadcrumbDivider className={'opacity-20'} />}
          </span>
        )
      })}
    </>
  )
}
