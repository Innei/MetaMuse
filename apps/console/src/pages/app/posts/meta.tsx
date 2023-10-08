import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  title: (t) => t('navigator.post'),
  icon: <i className="icon-[mingcute--code-line]" />,
  redirect: '/posts/list',
  priority: 2,
})
