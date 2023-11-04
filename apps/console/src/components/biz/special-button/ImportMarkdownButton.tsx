import { useMemo, useState } from 'react'
import { load } from 'js-yaml'
import { useEventCallback } from 'usehooks-ts'
import type { FC } from 'react'

import { input } from '@nextui-org/theme'

import { Button } from '~/components/ui/button'
import { DeclarativeModal } from '~/components/ui/modal/stacked/declarative-modal'
import { useDisclosure } from '~/hooks/common/use-disclosure'
import { usePreventComposition } from '~/hooks/common/use-prevent-composition'
import { useUncontrolledInput } from '~/hooks/common/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'

type ParsedValue = {
  title?: string
  text: string
  meta?: Record<string, any>
}
export const ImportMarkdownButton: FC<{
  onParsedValue: (parsedValue: ParsedValue) => void
}> = ({ onParsedValue }) => {
  const [, getValue, ref] = useUncontrolledInput<HTMLTextAreaElement>()
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const handleParseContent = useEventCallback(() => {
    let value = getValue()
    if (!value) return

    const hasHeaderYaml = /^---\n((.|\n)*?)\n---/.exec(value)

    const parsedValue: ParsedValue = {} as any

    if (hasHeaderYaml?.length) {
      const headerYaml = hasHeaderYaml[1]
      const meta: Record<string, any> = load(headerYaml) as any

      parsedValue.meta = meta

      // remove header yaml
      value = value.replace(hasHeaderYaml[0], '')
    }
    // trim value again
    const str = value.trim()
    const lines = str.split('\n')
    // if first line is not empty, start with `#`
    const title = lines[0].startsWith('#')
      ? lines[0].replace(/^#/, '').trim()
      : ''

    if (title) {
      parsedValue.title = title
      lines.shift()
    }

    parsedValue.text = lines.join('\n').trim()

    onParsedValue(parsedValue)

    onClose()
  })

  const t = useI18n()
  const inputTv = useMemo(
    () =>
      input({
        variant: 'flat',
      }),
    [],
  )

  const [textareaEl, setTextAreaEl] = useState<HTMLTextAreaElement | null>()
  usePreventComposition(textareaEl!)
  return (
    <>
      <Button variant="outline" onClick={onOpen}>
        {t('common.import')}
      </Button>
      <DeclarativeModal
        open={isOpen}
        onOpenChange={onOpenChange}
        title={t('common.import')}
      >
        <div className="lg:w-[800px] max-w-full">
          <p className="opacity-60">{t('module.parse_md_yaml.title')}</p>
          <div
            className={inputTv.inputWrapper({
              className: 'h-[calc(70vh-15rem)] max-h-[600px] mt-5 flex-grow',
            })}
          >
            <textarea
              ref={(el) => {
                // @ts-expect-error
                ref.current = el
                setTextAreaEl(el)
              }}
              className={inputTv.input({
                className: 'h-0 flex-grow w-full resize-none',
              })}
            />
          </div>

          <DeclarativeModal.FooterAction>
            <Button variant="default" onClick={handleParseContent}>
              {t('common.ok')}
            </Button>
          </DeclarativeModal.FooterAction>
        </div>
      </DeclarativeModal>
    </>
  )
}
