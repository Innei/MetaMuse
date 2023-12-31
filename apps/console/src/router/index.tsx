import React, { createElement } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import AppLayout from '../pages/app/layout'
import { appRoutes } from './builder'

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(AppLayout),
    children: appRoutes,
  },
  {
    path: '/login',
    Component: React.lazy(() => import('../pages/login/page')),
  },

  {
    path: '/setup',
    Component: React.lazy(() => import('../pages/setup/page')),
  },
])

export const Router = () => {
  return <RouterProvider router={router} />
}
