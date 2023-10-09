import {
  Button,
  ButtonGroup,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'
import { useRef, useState } from 'react'
import type { FormForwardRef } from '~/components/ui/form'

import { EditorLayer } from '~/components/modules/writing/EditorLayer'
import { Form, FormInput, FormSubmit } from '~/components/ui/form'
import { stringRuleMax, stringRuleUrl } from '~/components/ui/form/utils'
import { NextUIModal } from '~/components/ui/modal'
import { useI18n } from '~/i18n/hooks'

export default function Page() {
  const t = useI18n()
  return (
    <EditorLayer>
      {t('navigator.topic')}
      <ActionButtonGroup />
    </EditorLayer>
  )
}

const ActionButtonGroup = () => {
  return (
    <ButtonGroup>
      <NewButton />
    </ButtonGroup>
  )
}

const NewButton = () => {
  const t = useI18n()
  const [newModalOpen, setNewModalOpen] = useState(false)

  const formRef = useRef<FormForwardRef>(null)

  return (
    <>
      <Button
        onClick={() => {
          setNewModalOpen(true)
        }}
        variant="shadow"
        color="primary"
      >
        {t('common.new')}
      </Button>
      <NextUIModal
        size="lg"
        isOpen={newModalOpen}
        onClose={() => {
          setNewModalOpen(false)
        }}
      >
        <ModalContent>
          <ModalHeader>
            {t('common.new')} - {t('navigator.topic')}
          </ModalHeader>

          <Form
            ref={formRef}
            className="p-6 gap-4 flex flex-col"
            onSubmit={(e, res) => {
              console.log(e, res)
            }}
          >
            <FormInput
              name="name"
              label={t('common.name')}
              required
              rules={stringRuleMax(64)}
            />

            <FormInput
              name="slug"
              label={t('common.slug')}
              required
              rules={stringRuleMax(128)}
            />
            <FormInput
              name="desc"
              required
              label={t('common.desc')}
              rules={stringRuleMax(255)}
            />
            <FormInput
              name="icon"
              label={t('common.icon')}
              emptyAsNull
              rules={stringRuleUrl({ optional: true })}
              endContent={<i className="icon-[mingcute--upload-2-line]" />}
            />
            <FormInput
              emptyAsNull
              name="longDesc"
              textarea
              label={t('common.longdesc')}
              rules={stringRuleMax(1024)}
            />

            <div className="flex justify-end">
              <FormSubmit />
            </div>
          </Form>
        </ModalContent>
      </NextUIModal>
    </>
  )
}
