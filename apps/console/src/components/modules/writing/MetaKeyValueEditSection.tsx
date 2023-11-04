import { useMemo, useRef } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { FC } from 'react'

import { Button } from '~/components/ui'
import { useModalStack } from '~/components/ui/modal/stacked/provider'
import { useAsyncMonaco } from '~/hooks/biz/use-async-monaco'
import { useI18n } from '~/i18n/hooks'

import { styles } from './styles'

type KeyValueString = string
interface MetaKeyValueEditSectionProps {
  keyValue: object | KeyValueString
  onChange: (keyValue: object) => void
}

const safeParse = (value: string) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return {}
  }
}

const TAB_SIZE = 2

export const MetaKeyValueEditSection: FC<MetaKeyValueEditSectionProps> = (
  props,
) => {
  const { keyValue, onChange } = props
  const objectValue = useMemo(
    () => (typeof keyValue === 'string' ? safeParse(keyValue) : keyValue),
    [keyValue],
  )
  const { present } = useModalStack()
  const handlePresentModal = useEventCallback(() => {
    present({
      title: `${t('common.edit')} Meta`,
      content: ({ dismiss }) => (
        <EditorModal
          value={JSON.stringify(objectValue, null, TAB_SIZE)}
          onChange={onChange}
          dismiss={dismiss}
        />
      ),
    })
  })
  const t = useI18n()
  return (
    <div className="flex flex-col space-y-4 relative">
      <div className="flex justify-between items-center">
        <label className={styles.slots.label}>Meta</label>

        <Button size="xs" onClick={handlePresentModal}>
          {t('common.edit')}
        </Button>
      </div>
      <SyntaxHighlighter
        language="json"
        style={atomOneDark}
        className="rounded-md"
      >
        {JSON.stringify(objectValue, null, TAB_SIZE)}
      </SyntaxHighlighter>
    </div>
  )
}

const isValidJSONString = (value: string) => {
  try {
    JSON.parse(value)
    return true
  } catch (e) {
    return false
  }
}

const EditorModal: FC<{
  value: string
  dismiss: () => void
  onChange: (value: object) => void
}> = ({ value, onChange, dismiss }) => {
  const currentEditValueRef = useRef(value)
  const { editorWrapperRef } = useAsyncMonaco(
    value,
    (value) => {
      currentEditValueRef.current = value
    },
    {
      language: 'json',
    },
  )

  const t = useI18n()
  const handleSave = () => {
    if (!isValidJSONString(currentEditValueRef.current)) {
      toast.error(t('common.invalidJSON'))
      return
    }
    onChange(JSON.parse(currentEditValueRef.current) as Record<string, unknown>)

    dismiss()
  }

  return (
    <div className="flex flex-col w-full lg:w-[600px] flex-grow relative">
      <div ref={editorWrapperRef} className="h-[400px]" />
      <div className="flex justify-end flex-shrink-0">
        <Button size="sm" onClick={handleSave} color="primary">
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
