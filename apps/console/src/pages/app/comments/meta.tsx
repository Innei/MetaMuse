import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  title: (t) => t('navigator.comment'),
  icon: <i className="icon-[mingcute--comment-line]" />,
  priority: 4,
})
