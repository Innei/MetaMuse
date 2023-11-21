import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  title: (t) => t('navigator.page'),
  icon: <i className="icon-[mingcute--file-line]" />,
  redirect: '/pages/list',
  priority: 1,
})
