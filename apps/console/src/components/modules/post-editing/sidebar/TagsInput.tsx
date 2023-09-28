import { Chip } from '@nextui-org/react'
import React, { useState } from 'react'
import type { PostTag } from '@model'

import { select } from '@nextui-org/theme'

import { Autocomplete } from '~/components/ui/AutoCompletion'
import { useUncontrolledInput } from '~/hooks/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import { usePostModelDataSelector } from '../data-provider'

const styles = select({
  variant: 'faded',
})
export const TagsInput = () => {
  const tags = usePostModelDataSelector((data) => data?.tags)
  const t = useI18n()

  const handleClose = (tag: PostTag) => {}

  const [newTag, setNewTag] = useState(false)
  return (
    <div>
      <label
        className={styles.label({
          className: 'text-foreground',
        })}
      >
        {t('common.tags')}
      </label>

      <div className="mt-2 flex flex-wrap space-x-2">
        {tags?.map((tag) => (
          <Chip
            className="text-xs"
            key={tag.id}
            onClose={() => handleClose(tag)}
            variant="flat"
          >
            {tag.name}
          </Chip>
        ))}

        {!newTag ? (
          <Chip
            className="text-xs"
            variant="flat"
            color="primary"
            onClick={() => {
              setNewTag(true)
            }}
          >
            {t('common.new')}
          </Chip>
        ) : (
          <TagCompletion />
        )}
      </div>
    </div>
  )
}

const TagCompletion = () => {
  trpc.post.tags.useQuery()
  const { mutateAsync: createTag } = trpc.post.createTag.useMutation()
  const [, getValue, inputRef] = useUncontrolledInput()

  return (
    <Autocomplete
      onSuggestionSelected={(suggestion) => {}}
      suggestions={[]}
      onConfirm={(value) => {}}
    />
  )
}
