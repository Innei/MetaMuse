import { Avatar, Button } from '@nextui-org/react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { SeoDto } from '@core/modules/configs/configs.dto'
import type { RouteExtendObject } from '~/router/interface'
import type { MouseEventHandler, ReactNode } from 'react'

import { useIsMobile } from '~/atoms'
import { BreadcrumbDivider } from '~/components/icons'
import { PresentDrawer } from '~/components/ui/drawer'
import { clsxm } from '~/lib/helper'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'
import { appRoutes } from '~/router/builder'
import { useExtractTitleFunction } from '~/router/helper'
import { useCurrentRouteObject } from '~/router/hooks'
import { useUser } from '~/store/user'

import { ThemeToggle } from './ThemeToggle'

export const LayoutHeader = () => {
  const { data: seo } = trpc.aggregate.queryConfigByKey.useQuery({
    key: 'seo',
  })
  return (
    <header className="fixed left-0 right-0 top-0 z-[19] border-b-[0.5px] border-zinc-200 bg-white/80 px-6 backdrop-blur dark:border-neutral-900 dark:bg-zinc-900/80">
      <nav className="flex h-16 items-center">
        <div className="flex items-center space-x-1 lg:space-x-3">
          <button className="p-2 text-2xl">𝕄</button>
          <BreadcrumbDivider className="opacity-20" />
          <span className="font-bold opacity-90 text-sm md:text-base">
            {(seo as SeoDto)?.title}
          </span>
          <BreadcrumbDivider className="opacity-0 lg:opacity-20" />
        </div>

        <div className="relative flex min-w-0 flex-grow items-center justify-between">
          <HeaderMenu className="hidden lg:flex" />

          <RightBar />
        </div>
      </nav>
      <SecondaryNavLine />
    </header>
  )
}

const RightBar = () => {
  const user = useUser()
  return (
    <div className="relative flex-grow lg:flex-grow-0 justify-end flex items-center space-x-2">
      <ThemeToggle />
      <MobileMenuDrawerButton />
      <Avatar
        size="sm"
        src={user?.avatar || ''}
        isBordered
        showFallback
        name={user?.name}
      />
    </div>
  )
}

const MobileMenuDrawerButton = () => {
  const isMobile = useIsMobile()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  if (!isMobile) return null

  return (
    <PresentDrawer content={HeaderMenu}>
      <Button
        variant="light"
        className="rounded-full !mr-2"
        isIconOnly
        onClick={() => {
          setIsDrawerOpen(!isDrawerOpen)
        }}
      >
        <i className="icon-[mingcute--menu-line]" />
      </Button>
    </PresentDrawer>
  )
}

const HeaderMenu: Component = ({ className }) => {
  const extractTitle = useExtractTitleFunction()
  const firstLevelMenu = appRoutes
    .map((route) => {
      const title = route.meta?.title
      if (!title) return null

      return {
        title: extractTitle(title),
        path: route.path,
        icon: route.meta?.icon,
      }
    })
    .filter(Boolean) as { title: string; path: string; icon?: ReactNode }[]

  const routeObject = useCurrentRouteObject()

  const handleNav: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    e.preventDefault()

    const href = new URL((e.currentTarget as HTMLAnchorElement).href).pathname

    if (href.startsWith(location.pathname)) return
    router.navigate(href)
  }, [])

  return (
    <ul className={clsxm('ml-2 items-center gap-2 text-sm', className)}>
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
              onClick={handleNav}
              className={clsx(
                'flex items-center relative space-x-1 rounded-xl p-2 duration-200 hover:bg-default-200',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="header"
                  className="absolute z-[-1] inset-0 bg-default/40 rounded-xl"
                />
              )}
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
  const routeObject = useCurrentRouteObject()
  const parent = routeObject.parent
  if (!parent) return null
  return (
    <nav className="flex h-12 items-center justify-between overflow-auto lg:overflow-visible">
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

  const extractTitle = useExtractTitleFunction()

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
                'flex items-center relative space-x-1 rounded-lg px-2 py-1 duration-200 hover:bg-default-200',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sub"
                  className="absolute z-[-1] inset-0 bg-default/40 rounded-xl"
                />
              )}
              {route.meta?.icon}
              <span>{extractTitle(route.meta?.title)}</span>
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

  const extractTitle = useExtractTitleFunction()
  return (
    <>
      {routes.map((route, index) => {
        const isLast = index === routes.length - 1

        return (
          <span key={route.path} className={clsx('flex items-center py-1')}>
            <span>{extractTitle(route.meta?.title)}</span>
            {!isLast && <BreadcrumbDivider className="opacity-20" />}
          </span>
        )
      })}
    </>
  )
}
