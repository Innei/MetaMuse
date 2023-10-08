import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  title: (t) => t('navigator.edit'),
  icon: <i className="icon-[mingcute--pen-line]" />,
  priority: 2,
})
