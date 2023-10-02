import type { FC } from 'react'

type KeyValueString = string
interface MetaKeyValueEditSectionProps {
  keyValue: object | KeyValueString
  onChange: (keyValue: object) => void
}

export const MetaKeyValueEditSection: FC<MetaKeyValueEditSectionProps> = (
  props,
) => {
  const { keyValue, onChange } = props
  return <div />
}
