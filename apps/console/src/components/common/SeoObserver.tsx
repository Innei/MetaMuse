import { useLayoutEffect } from 'react'
import type { RouteExtendObject } from '~/router/interface'

import { useAppInitialData } from '~/providers/initial'
import { useExtractTitle, useExtractTitleFunction } from '~/router/helper'
import { useCurrentRouteObject } from '~/router/hooks'

export const SeoObserver = () => {
  const route = useCurrentRouteObject()

  const { title: maybeTitle } = route.meta || {}
  const parent = route.parent

  const title = useExtractTitle(maybeTitle)
  const extractTitle = useExtractTitleFunction()
  const { seo } = useAppInitialData()

  useLayoutEffect(() => {
    const beforeTitle = document.title

    let jointParentTitle = ''

    if (parent?.meta?.title) {
      jointParentTitle = extractTitle(parent.meta.title) || ''
      findParentTitle(parent)
    }

    function findParentTitle(route: RouteExtendObject) {
      if (route.parent?.meta?.title) {
        jointParentTitle = `${extractTitle(
          route.parent.meta.title,
        )} - ${jointParentTitle}`
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
