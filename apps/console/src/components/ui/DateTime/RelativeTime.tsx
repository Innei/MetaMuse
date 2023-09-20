import { Tooltip } from '@nextui-org/react'
import { FC, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'

import { relativeTimeFromNow } from '~/lib/datetime'

export const RelativeTime: FC<{
  time: string | Date
}> = ({ time }) => {
  const [currentTime, setCurrentTime] = useState(() =>
    relativeTimeFromNow(time),
  )
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(relativeTimeFromNow(time))
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [time])
  return (
    <Tooltip
      content={useMemo(() => dayjs(time).format('YYYY-MM-DD HH:mm:ss'), [time])}
    >
      <span>{currentTime}</span>
    </Tooltip>
  )
}
