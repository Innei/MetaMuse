import { useLayoutEffect, useState } from 'react'

import { FloatPopover } from '~/components/ui/float-popover'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

interface IpInfoPopoverProps {
  ip: string
}
export const IpInfoPopover: Component<IpInfoPopoverProps> = (props) => {
  const [ipInfo, setIpInfo] = useState<string | null>(null)

  const setIpInfoText = (info: IP) => {
    setIpInfo(`IP: ${info.ip}<br />
      城市：${
        [info.countryName, info.regionName, info.cityName]
          .filter(Boolean)
          .join(' - ') || 'N/A'
      }<br />
      ISP: ${info.ispDomain || 'N/A'}<br />
      组织：${info.ownerDomain || 'N/A'}<br />
      范围：${info.range ? Object.values(info.range).join(' - ') : 'N/A'}
      `)
  }

  const { ip, className } = props

  const { data, isLoading, refetch } = trpc.tool.ip.useQuery(
    {
      ip,
    },
    {
      enabled: false,
    },
  )

  useLayoutEffect(() => {
    if (data) setIpInfoText(data as IP)
  }, [data])
  const t = useI18n()
  return (
    <FloatPopover
      type="tooltip"
      onOpen={() => {
        refetch()
      }}
      TriggerComponent={() => <span className={className}>{ip}</span>}
    >
      {isLoading ? (
        `${t('common.loading')}...`
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: ipInfo as any,
          }}
        />
      )}
    </FloatPopover>
  )
}

interface IP {
  ip: string
  countryName: string
  regionName: string
  cityName: string
  ownerDomain: string
  ispDomain: string
  range?: {
    from: string
    to: string
  }
}
