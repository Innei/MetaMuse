import { Category, Post, PostTag } from '@model'

export type PostModel = Post & {
  category: Category
  tags: PostTag[]
}
