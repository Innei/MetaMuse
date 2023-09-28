import {
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { load } from 'js-yaml'
import { useEventCallback } from 'usehooks-ts'
import type { FC } from 'react'

import { input } from '@nextui-org/theme'

import { NextUIModal } from '~/components/ui/Modal'
import { usePreventComposition } from '~/hooks/use-prevent-composition'
import { useUncontrolledInput } from '~/hooks/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'

type ParsedValue = {
  title?: string
  text: string
  meta?: Record<string, any>
}
export const ParseYAMLContentButton: FC<{
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
      <Button onClick={onOpen} variant="ghost">
        {t('common.import')}
      </Button>
      <NextUIModal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{t('common.import')}</ModalHeader>
          <ModalBody>
            <p className="-mb-4 -translate-y-4 text-xs opacity-60">
              {t('module.parse_md_yaml.title')}
            </p>
            <div
              className={inputTv.inputWrapper({
                className: 'h-[calc(100vh-10rem)] max-h-[600px]',
              })}
            >
              <textarea
                ref={(el) => {
                  // @ts-expect-error
                  ref.current = el
                  setTextAreaEl(el)
                }}
                className={inputTv.input({
                  className: 'h-full w-full resize-none',
                })}
              />
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-end space-x-2">
            <Button color="primary" onClick={handleParseContent}>
              {t('common.ok')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </NextUIModal>
    </>
  )
}
