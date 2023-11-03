import { IpInfoPopover } from '~/components/biz/ip'
import { OouiUserAnonymous } from '~/components/icons'
import { Avatar } from '~/components/ui/avatar'

import { UrlRender } from './CommentDesktopTable'

export const CommentAuthorCell = (props: NormalizedComment) => {
  const { author, avatar, url, mail, ip, isWhispers } = props
  return (
    <div className="flex space-x-8 mt-6">
      <div className="self-center lg:self-start">
        <Avatar src={avatar || ''} fallbackName={author[0]} />
      </div>
      <div className="flex text-sm flex-col gap-1">
        <div className="flex items-center space-x-1">
          <UrlRender url={url} author={author} />
          {isWhispers && <OouiUserAnonymous />}
        </div>

        <a className="text-sm text-primary" href={`mailto:${mail}`}>
          {mail}
        </a>

        {ip && <IpInfoPopover className="text-foreground/60 text-sm" ip={ip} />}
      </div>
    </div>
  )
}
