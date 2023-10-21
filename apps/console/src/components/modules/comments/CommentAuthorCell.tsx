import { Avatar, Link } from '@nextui-org/react'

import { IpInfoPopover } from '~/components/biz/ip/IpInfoPopover'
import { OouiUserAnonymous } from '~/components/icons'

import { UrlRender } from './CommentDesktopTable'

export const CommentAuthorCell = (props: NormalizedComment) => {
  const { author, avatar, url, mail, ip, isWhispers } = props
  return (
    <div className="flex space-x-8">
      <div>
        <Avatar size="md" src={avatar || ''} name={author[0]} />
      </div>
      <div className="flex text-sm flex-col gap-1">
        <div className="flex items-center space-x-1">
          <UrlRender url={url} author={author} />
          {isWhispers && <OouiUserAnonymous />}
        </div>

        <Link
          size="sm"
          className="text-sm"
          color="secondary"
          href={`mailto:${mail}`}
        >
          {mail}
        </Link>

        {ip && <IpInfoPopover className="text-foreground/60 text-sm" ip={ip} />}
      </div>
    </div>
  )
}
