import {
  Avatar,
  Button,
  ButtonGroup,
  Divider,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { produce } from 'immer'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { toast } from 'sonner'
import type { FormForwardRef } from '~/components/ui/form'
import type { FC } from 'react'

import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll'

import { useIsMobile } from '~/atoms'
import { DeleteConfirmButton } from '~/components/biz/special-button/DeleteConfirmButton'
import { Empty } from '~/components/common/Empty'
import { PageLoading } from '~/components/common/PageLoading'
import { EditorLayer } from '~/components/modules/writing/EditorLayer'
import { ListTable } from '~/components/modules/writing/ListTable'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { MotionButtonBase } from '~/components/ui/button'
import { PresentDrawer } from '~/components/ui/drawer'
import { Form, FormInput, FormSubmit } from '~/components/ui/form'
import { stringRuleMax, stringRuleUrl } from '~/components/ui/form/utils'
import { NextUIModal } from '~/components/ui/modal'
import { useModalStack } from '~/components/ui/modal/stacked/provider'
import { Uploader } from '~/components/ui/uploader'
import { withQueryPager } from '~/hooks/biz/use-query-pager'
import { useI18n } from '~/i18n/hooks'
import { diffSets } from '~/lib/diff'
import { buildNSKey } from '~/lib/key'
import { jotaiStore } from '~/lib/store'
import { trpc } from '~/lib/trpc'

import { NoteTableColumns } from '../list/page'

const selectedTopicIdAtom = atomWithStorage(
  buildNSKey('select-topic-id'),
  null as string | null,
)
export default function Page() {
  const t = useI18n()
  const { isLoading, data } = trpc.topic.all.useQuery()
  const setId = useSetAtom(selectedTopicIdAtom)
  const onceRef = useRef(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) return
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

  const { mutateAsync: deleteTopic } = trpc.topic.delete.useMutation()
  const utils = trpc.useUtils()
  if (!topic) return <Empty />
  return (
    <main className="h-full overflow-auto flex flex-col">
      <div className="lg:h-0 flex-grow flex flex-col mt-0">
        <div className="grid grid-cols-[auto,1fr] my-4 gap-4">
          <Avatar
            src={topic.icon || ''}
            name={topic.name.slice(0, 1)}
            size="lg"
          />
          <div className="flex flex-col gap-2">
            <span className="font-medium text-xl">{topic?.name}</span>
            <span className="float-right text-foreground-600 text-sm">
              /topics/{topic?.slug}
            </span>
            <span className="text-foreground-800 text-sm">
              {topic?.introduce}
            </span>
            <span className="mt-2 text-foreground-600 text-sm">
              {topic?.description}
            </span>
          </div>
        </div>
        <div className="space-x-4">
          <EditButton />
          <DeleteConfirmButton
            deleteItemText={topic.name}
            onDelete={() =>
              deleteTopic({ id: topic.id })
                .then(() => {
                  utils.topic.invalidate()
                  jotaiStore.set(selectedTopicIdAtom, null)
                })
                .catch((e) => void toast.error(e.message))
            }
          />
        </div>

        <Divider className="my-4" />
        <NoteTopicTable />
      </div>
    </main>
  )
}

const NoteTopicTable = withQueryPager(() => {
  const topicId = useAtomValue(selectedTopicIdAtom) || ''
  const { data } = trpc.topic.notesByTopicId.useQuery(
    { topicId },
    { enabled: !!topicId },
  )

  const { mutateAsync: removeNotesFromTopic } =
    trpc.topic.removeNotesFromTopic.useMutation()
  const utils = trpc.useUtils()
  const t = useI18n()
  const { present } = useModalStack()
  return (
    <ListTable
      data={data}
      // @ts-expect-error
      columns={NoteTableColumns}
      onNewClick={() => {
        present({
          title: t('module.topic.add_notes_to_topic'),
          content: () => <AddNotesToTopicModal topicId={topicId} />,
        })
      }}
      onBatchDeleteClick={(ids) => {
        removeNotesFromTopic({ topicId, noteIds: ids })
          .then(() => {
            toast.success(t('common.delete-success'))
            utils.topic.notesByTopicId.invalidate({
              topicId,
            })
          })
          .catch((e) => {
            toast.error(e.message)
          })
      }}
      tableClassName="min-h-0 !lg:h-0 flex-grow overflow-auto"
    />
  )
})

const AddNotesToTopicModal = ({ topicId }: { topicId: string }) => {
  const { data, fetchNextPage, isLoading, hasNextPage } =
    trpc.note.paginate.useInfiniteQuery(
      {
        size: 20,
      },
      {
        getNextPageParam: (lastPage) =>
          lastPage.pagination.hasNextPage
            ? lastPage.data[lastPage.data.length - 1]?.id
            : void 0,
      },
    )
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: fetchNextPage,
  })

  const t = useI18n()
  const selection = useMemo(() => {
    const notes = data?.pages.flatMap((page) => page.data) || []

    const set = new Set<string>()
    for (const note of notes) {
      if (!note) continue
      if (note.topicId === topicId) {
        set.add(note.id)
      }
    }
    return set
  }, [data])

  const utils = trpc.useUtils()
  function handleNoteMutation(noteIds: string[], topicId?: string) {
    utils.note.paginate.setInfiniteData(
      {
        size: 20,
      },
      (prev) => {
        return produce(prev, (draft) => {
          if (!draft?.pages) return
          for (const page of draft.pages) {
            for (const note of page.data) {
              if (!note) continue
              if (noteIds.includes(note.id)) {
                note.topicId = topicId || null
              }
            }
          }
        })
      },
    )
  }

  const { mutateAsync: addNotes } = trpc.topic.addNotesToTopic.useMutation({
    onMutate: ({ noteIds, topicId }) => {
      handleNoteMutation(noteIds, topicId)
    },
  })

  const { mutateAsync: removeNotes } =
    trpc.topic.removeNotesFromTopic.useMutation({
      onMutate: ({ noteIds }) => {
        handleNoteMutation(noteIds)
      },
    })

  const isDirtyRef = useRef(false)

  useEffect(() => {
    return () => {
      if (isDirtyRef.current) {
        utils.note.paginate.invalidate()
        utils.topic.notesByTopicId.invalidate({
          topicId,
        })
      }
    }
  }, [])

  return (
    <Table
      isHeaderSticky
      baseRef={scrollerRef}
      selectedKeys={selection}
      onSelectionChange={(keys) => {
        isDirtyRef.current = true
        const diff = diffSets(keys as Set<string>, selection)
        if (diff.added.size) {
          removeNotes({ topicId, noteIds: Array.from(diff.added) }).catch(
            (e) => {
              toast.error(e.message)
            },
          )
        }
        if (diff.removed.size) {
          addNotes({ topicId, noteIds: Array.from(diff.removed) }).catch(
            (e) => {
              toast.error(e.message)
            },
          )
        }
      }}
      bottomContent={
        hasNextPage ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} />
          </div>
        ) : null
      }
      classNames={{
        base: 'max-h-[520px] overflow-auto',
        wrapper: 'bg-transparent border-0 ring-0 shadow-none p-0',
      }}
      selectionMode="multiple"
    >
      <TableHeader>
        <TableColumn key="title">
          <span>{t('common.title')}</span>
        </TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        items={data?.pages.flatMap((page) => page.data) || []}
        loadingContent={<Spinner />}
      >
        {(item) => (
          <TableRow key={item!.id}>
            <TableCell>
              <TitleExtra data={item!} />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const Topics = () => {
  const { data: topics } = trpc.topic.all.useQuery()
  const [selectedTopicId, setSelectedTopicId] = useAtom(selectedTopicIdAtom)

  if (topics?.length === 0) return <Empty />
  return (
    <ScrollShadow className="h-0 overflow-auto flex-grow">
      <div className="p-0 gap-0 dark:divide-default-100/80 max-w-full lg:max-w-[300px]">
        <div className="gap-1 flex flex-col">
          {(topics || []).map((topic) => (
            <MotionButtonBase
              key={topic.id}
              data-active={selectedTopicId === topic.id}
              onClick={() => {
                setSelectedTopicId(topic.id)
              }}
              className="flex truncate w-full h-12 py-2 px-4 rounded-lg items-center hover:bg-default-100/80 data-[active=true]:bg-default-200/80"
            >
              {topic.name}
            </MotionButtonBase>
          ))}
        </div>
      </div>
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
  const utils = trpc.useUtils()
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
  const { mutateAsync: update } = trpc.topic.update.useMutation()
  const utils = trpc.useUtils()
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
              update({
                ...res,
                id: topic!.id,
              })
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
        name="introduce"
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
        name="description"
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
