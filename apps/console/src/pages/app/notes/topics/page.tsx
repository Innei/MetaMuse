import {
  Button,
  ButtonGroup,
  Divider,
  Listbox,
  ListboxItem,
  ModalContent,
  ModalHeader,
  ScrollShadow,
} from '@nextui-org/react'
import { useEffect, useRef, useState } from 'react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import type { FormForwardRef } from '~/components/ui/form'
import type { FC } from 'react'

import { useIsMobile } from '~/atoms'
import { Empty } from '~/components/common/Empty'
import { PageLoading } from '~/components/common/PageLoading'
import { EditorLayer } from '~/components/modules/writing/EditorLayer'
import { PresentDrawer } from '~/components/ui/drawer'
import { Form, FormInput, FormSubmit } from '~/components/ui/form'
import { stringRuleMax, stringRuleUrl } from '~/components/ui/form/utils'
import { NextUIModal } from '~/components/ui/modal'
import { EllipsisHorizontalTextWithTooltip } from '~/components/ui/typography'
import { Uploader } from '~/components/ui/uploader'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

const selectedTopicIdAtom = atom(null as string | null)
export default function Page() {
  const t = useI18n()
  const { isLoading, data } = trpc.topic.all.useQuery()
  const setId = useSetAtom(selectedTopicIdAtom)
  const onceRef = useRef(false)

  useEffect(() => {
    // set default selected topic, first
    if (onceRef.current) {
      return
    }
    onceRef.current = true
    if (!data) return
    if (!isLoading) {
      const [first] = data || []
      if (first) {
        setId(first.id)
      }
    }
  }, [isLoading, data])

  const isMobile = useIsMobile()
  if (isLoading) return <PageLoading />
  return (
    <EditorLayer mainClassName="flex lg:grid lg:grid-cols-[400px_auto] lg:gap-4">
      {t('navigator.topic')}
      <ActionButtonGroup />
      <Topics />
      {!isMobile ? <TopicDetail /> : <div />}
      <>{isMobile && <MobilePresentDetail />}</>
    </EditorLayer>
  )
}

const MobilePresentDetail = () => {
  const [open, setOpen] = useState(false)
  const [topicId, setTopicId] = useAtom(selectedTopicIdAtom)
  useEffect(() => {
    if (topicId) {
      setOpen(true)
    }
  }, [topicId])
  return (
    <PresentDrawer
      open={open}
      content={TopicDetail}
      onOpenChange={(open) => {
        setOpen(open)
        !open && setTopicId(null)
      }}
    />
  )
}

const useCurrentSelectedTopic = () => {
  const topicId = useAtomValue(selectedTopicIdAtom)

  const { data: topics } = trpc.topic.all.useQuery()
  const topic = topics?.find((t) => t.id === topicId)
  return topic
}
const TopicDetail = () => {
  const topic = useCurrentSelectedTopic()
  const t = useI18n()
  if (!topic) return <Empty />
  return (
    <main>
      <h2 className="font-medium text-lg">{t('module.topic.detail')}</h2>

      {/* TODO icon render */}
      <div className="flex flex-col my-4">
        <span>
          {t('common.name')}: {topic?.name}
        </span>
        <span>
          {t('common.desc')}: {topic?.introduce}
        </span>
        <span>
          {t('common.longdesc')}: {topic?.description}
        </span>

        <span>
          {t('common.slug')}: /topics/{topic?.slug}
        </span>
      </div>
      <EditButton />

      <Divider className="my-4" />
      {/* TODO notes table */}
    </main>
  )
}

const Topics = () => {
  const { data: topics } = trpc.topic.all.useQuery()
  const [selectedTopicId, setSelectedTopicId] = useAtom(selectedTopicIdAtom)
  return (
    <ScrollShadow className="h-0 overflow-auto flex-grow">
      <Listbox
        onAction={(key) => {
          setSelectedTopicId(key as string)
        }}
        className="p-0 gap-0 dark:divide-default-100/80 bg-content1 max-w-[300px]"
        itemClasses={{
          base: 'px-3 gap-3 h-12 data-[hover=true]:bg-default-100/80 data-[active=true]:bg-default-200/80',
        }}
      >
        {(topics || []).map((topic) => (
          <ListboxItem
            key={topic.id}
            endContent={null}
            startContent={null}
            data-active={selectedTopicId === topic.id}
          >
            <EllipsisHorizontalTextWithTooltip>
              {topic.name}
            </EllipsisHorizontalTextWithTooltip>
          </ListboxItem>
        ))}
      </Listbox>
    </ScrollShadow>
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
  const { mutateAsync: create } = trpc.topic.create.useMutation()
  const utils = trpc.useContext()
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

          <EditingForm
            onSubmit={(res) => {
              create(res)
                .then(() => {
                  setNewModalOpen(false)
                  toast.success(t('common.create-success'))
                  utils.topic.invalidate()
                })
                .catch((e) => {
                  toast.error(e.message)
                })
            }}
          />
        </ModalContent>
      </NextUIModal>
    </>
  )
}

const EditButton = () => {
  const topic = useCurrentSelectedTopic()
  const t = useI18n()
  const [modalOpen, setModalOpen] = useState(false)
  const { mutateAsync: create } = trpc.topic.update.useMutation()
  const utils = trpc.useContext()
  return (
    <>
      <Button
        onClick={() => {
          setModalOpen(true)
        }}
        color="primary"
      >
        {t('common.edit')}
      </Button>
      <NextUIModal
        size="lg"
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
        }}
      >
        <ModalContent>
          <ModalHeader>
            {t('common.edit')} - {t('navigator.topic')}
          </ModalHeader>

          <EditingForm
            initialValues={topic}
            onSubmit={(res) => {
              create(res)
                .then(() => {
                  setModalOpen(false)
                  toast.success(t('common.save-success'))
                  utils.topic.invalidate()
                })
                .catch((e) => {
                  toast.error(e.message)
                })
            }}
          />
        </ModalContent>
      </NextUIModal>
    </>
  )
}

const EditingForm: FC<{
  onSubmit: (res: any) => void
  initialValues?: any
}> = ({ onSubmit, initialValues }) => {
  const formRef = useRef<FormForwardRef>(null)
  const t = useI18n()
  return (
    <Form
      ref={formRef}
      initialValues={initialValues}
      className="p-6 gap-4 flex flex-col"
      onSubmit={(e, res) => {
        console.log(e, res)
        onSubmit(res)
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
        endContent={
          <Uploader
            accept="image/*"
            bizType="icon"
            addAuthHeader
            onFinish={(_, res) => {
              formRef.current?.setValue('icon', res.url)
            }}
          >
            <i className="icon-[mingcute--upload-2-line]" />
          </Uploader>
        }
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
  )
}
