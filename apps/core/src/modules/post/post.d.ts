type NormalizedPostModel = Awaited<
  ReturnType<import('./post.service').PostService['getPostById']>
>
