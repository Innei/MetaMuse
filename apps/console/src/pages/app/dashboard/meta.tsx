import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  title: (t) => t('navigator.dashboard'),
  icon: <i className="icon-[mingcute--dashboard-line]" />,
  priority: 1,
})
