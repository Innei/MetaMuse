import { CategorySelector } from './CategorySelector'
import { TagsInput } from './TagsInput'

export const PostEditorSidebar = () => (
  <div className="flex flex-col space-y-8">
    <CategorySelector />

    <TagsInput />
  </div>
)
