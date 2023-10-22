import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { FC } from 'react'

import { relativeTimeFromNow } from '~/lib/datetime'

import { Tooltip } from '../tooltip/Tooltip'

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
      tip={useMemo(() => dayjs(time).format('YYYY-MM-DD HH:mm:ss'), [time])}
    >
      <span>{currentTime}</span>
    </Tooltip>
  )
}
