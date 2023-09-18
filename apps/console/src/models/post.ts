import { Category, Post } from '@model'

export type PostWithCategory = Post & {
  category: Category
}
