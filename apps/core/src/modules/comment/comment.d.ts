type NormalizedCommentModel = Awaited<
  ReturnType<import('./comment.service').CommentService['getCommentById']>
>
