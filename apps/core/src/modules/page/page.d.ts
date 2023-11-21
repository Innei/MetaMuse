type NormalizedPageModel = Awaited<
  ReturnType<import('./page.service').PageService['getPageById']>
>
