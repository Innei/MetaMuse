import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  redirect: '/notes/list',
  title: (t) => t('navigator.note'),
  icon: <i className="icon-[mingcute--quill-pen-line]" />,
  priority: 3,
})
