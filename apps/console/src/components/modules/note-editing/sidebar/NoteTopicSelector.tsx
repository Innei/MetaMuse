import { Select, SelectItem } from '@nextui-org/react'
import { useMemo } from 'react'

import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import { useNoteModelSingleFieldAtom } from '../data-provider'

export const NoteTopicSelector = () => {
  const [topicId, setTopicId] = useNoteModelSingleFieldAtom('topicId')
  const { data: topics, isLoading } = trpc.topic.all.useQuery()
  const t = useI18n()
  return (
    <Select
      size="sm"
      isLoading={isLoading}
      labelPlacement="outside"
      placeholder=" "
      label={t('navigator.topic')}
      selectedKeys={useMemo(() => {
        if (!topicId) return new Set()
        return new Set([topicId])
      }, [topicId])}
      onSelectionChange={(key) => {
        // `all` is not possible
        if (key == 'all') return

        setTopicId(Array.from(key)[0] as string)
      }}
    >
      {(topics || []).map((topic) => (
        <SelectItem key={topic.id} value={topic.id}>
          {topic.name}
        </SelectItem>
      ))}
    </Select>
  )
}
