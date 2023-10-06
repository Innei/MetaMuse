import { defineRouteMeta } from '~/router/define'

export default defineRouteMeta({
  redirect: '/notes/list',
  title: '手记',
  icon: <i className="icon-[mingcute--quill-pen-line]" />,
  priority: 3,
})
