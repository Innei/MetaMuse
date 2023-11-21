export const enum Routes {
  Dashboard = '/dashboard',
  Login = '/login',

  PostList = '/posts/list',
  PostEditOrNew = '/posts/edit',

  NoteList = '/notes/list',
  NoteEditOrNew = '/notes/edit',

  PageEditOrNew = '/pages/edit',
  PageList = '/pages/list',
}

type Noop = never
type Pagination = {
  size?: number
  page?: number
}

export type PostsParams = Pagination & {
  sortBy?: string
  orderBy?: 'desc' | 'asc'
}

type OnlyId = {
  id: string
}
export type RouteParams<T extends Routes> = T extends Routes.Dashboard
  ? Noop
  : T extends Routes.PostList
  ? Pagination
  : T extends Routes.PostEditOrNew
  ? Partial<OnlyId>
  : T extends Routes.NoteList
  ? Pagination
  : T extends Routes.NoteEditOrNew
  ? Partial<OnlyId>
  : T extends Routes.PageList
  ? Noop
  : T extends Routes.PageEditOrNew
  ? Partial<OnlyId>
  : {}

export function routeBuilder<T extends Routes>(
  route: T,
  params: RouteParams<typeof route>,
) {
  let href: string = route
  switch (route) {
    case Routes.Dashboard: {
      href = '/'
      break
    }
    case Routes.NoteEditOrNew:
    case Routes.PageEditOrNew:
    case Routes.PostEditOrNew: {
      const p = params as Partial<OnlyId>

      p.id && (href += `?id=${p.id}`)
      break
    }
    case Routes.NoteList:
    case Routes.PostList: {
      const p = params as Pagination
      href += `?page=${p.page || 1}&size=${p.size || 10}`
      break
    }

    case Routes.PageList: {
      break
    }

    case Routes.Login: {
      href = '/login'
      break
    }
  }
  return href
}
