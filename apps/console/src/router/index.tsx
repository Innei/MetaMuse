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
])

export const Router = () => {
  return <RouterProvider router={router}></RouterProvider>
}
