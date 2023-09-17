import { useLayoutEffect } from 'react'

import { useAppInitialData } from '~/providers/initial'
import { useCurrentRouteObject } from '~/router/hooks'
import { RouteExtendObject } from '~/router/interface'

export const SeoObserver = () => {
  const route = useCurrentRouteObject()

  const { title } = route.meta || {}
  const parent = route.parent

  const { seo } = useAppInitialData()

  useLayoutEffect(() => {
    const beforeTitle = document.title

    let jointParentTitle = ''

    if (parent?.meta?.title) {
      jointParentTitle = parent.meta.title
      findParentTitle(parent)
    }

    function findParentTitle(route: RouteExtendObject) {
      if (route.parent?.meta?.title) {
        jointParentTitle = `${route.parent.meta.title} - ${jointParentTitle}`
        findParentTitle(route.parent)
      }
    }

    if (title)
      document.title = `${
        title + (jointParentTitle ? ` - ${jointParentTitle}` : '')
      } | ${seo.title}`

    return () => {
      document.title = beforeTitle
    }
  }, [title, seo.title])

  return null
}
