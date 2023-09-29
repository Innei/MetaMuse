import { Chip } from '@nextui-org/react'
import React, { useEffect, useMemo } from 'react'
import { atom, useAtom, useSetAtom } from 'jotai'
import type { PostTag } from '@model'
import type { Suggestion } from '~/components/ui/AutoCompletion'

import { select } from '@nextui-org/theme'

import { Autocomplete } from '~/components/ui/AutoCompletion'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import {
  usePostModelDataSelector,
  usePostModelGetModelData,
  usePostModelSetModelData,
} from '../data-provider'

const styles = select({
  variant: 'faded',
})

const tagInputAtom = atom(false)

export const TagsInput = () => {
  const tags = usePostModelDataSelector((data) => data?.tags)
  const t = useI18n()

  const setter = usePostModelSetModelData()
  const handleClose = (tag: PostTag) => {
    setter((prev) => {
      const newTags = prev.tags.filter((t) => t.id !== tag.id)
      return {
        ...prev,
        tags: newTags,
        tagIds: newTags.map((t) => t.id),
      }
    })
  }

  const [newTag, setNewTag] = useAtom(tagInputAtom)

  useEffect(() => {
    setNewTag(false)
    return () => setNewTag(false)
  }, [])

  return (
    <div>
      <label
        className={styles.label({
          className: 'text-foreground',
        })}
      >
        {t('common.tags')}
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Chip
            size="md"
            key={tag.id}
            onClose={() => handleClose(tag)}
            variant="bordered"
          >
            {tag.name}
          </Chip>
        ))}

        {!newTag ? (
          <Chip
            size="md"
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
  const { data: tags } = trpc.post.tags.useQuery(void 0, {
    refetchOnMount: true,
  })

  const { mutateAsync: createTag } = trpc.post.createTag.useMutation()

  const setter = usePostModelSetModelData()
  const getModelData = usePostModelGetModelData()

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!tags) return []
    const currentTagIds = getModelData()?.tagIds ?? []
    const tagIdSet = new Set(currentTagIds)
    return tags
      .filter((t) => !tagIdSet.has(t.id))
      .map((tag) => ({
        value: tag.id,
        name: tag.name,
      }))
  }, [getModelData, tags])

  const setInput = useSetAtom(tagInputAtom)

  return (
    <Autocomplete
      onSuggestionSelected={(suggestion) => {
        setter((prev) => {
          if (prev.tagIds.find((id) => id === suggestion.value)) return prev
          return {
            ...prev,
            tags: [
              ...prev.tags,
              { id: suggestion.value, name: suggestion.name, postId: [] },
            ],
            tagIds: [...prev.tagIds, suggestion.value],
          }
        })
        setInput(false)
      }}
      suggestions={suggestions}
      onConfirm={async (value) => {
        const data = await createTag({
          name: value,
        })

        setter((prev) => {
          if (prev.tagIds.find((id) => id === data.id)) return prev
          return {
            ...prev,
            tags: [...prev.tags, { id: data.id, name: value, postId: [] }],
            tagIds: [...prev.tagIds, data.id],
          }
        })

        setInput(false)
      }}
    />
  )
}
