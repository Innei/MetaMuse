export type PageModel = Omit<
  NormalizedPageModel,
  | 'category'
  | 'modified'
  | 'meta'
  | 'count'
  | 'created'
  | 'commentsIndex'
  | 'images'
> & {
  meta?: any
  created?: string
  images: any[]
}
