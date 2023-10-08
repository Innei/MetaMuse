import { IconParkOutlineTopic } from '~/components/icons'
import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  title: (t) => t('navigator.topic'),
  icon: <IconParkOutlineTopic />,
  priority: 3,
})
