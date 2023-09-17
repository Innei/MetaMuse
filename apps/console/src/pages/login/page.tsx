import { Avatar } from '@nextui-org/react'
import { useNavigate } from 'react-router-dom'
import { User } from '@model'
import clsx from 'clsx'
import useSWR from 'swr'

import { ErrorCodeEnum } from '@core/constants/error-code.constant'

import { ErrorComponent } from '~/components/common/Error'
import { BizError } from '~/lib/biz-error'
import { $axios } from '~/lib/request'

import styles from './index.module.css'

export default function LoginPage() {
  const { data, error } = useSWR<User>('/user', async () => {
    return $axios.get('/user')
  })

  const nav = useNavigate()

  if (error && error instanceof BizError) {
    if (error.code === ErrorCodeEnum.NotInitialized) {
      nav('/setup')
    }
  }

  if (error) {
    return <ErrorComponent errorText={error.message} />
  }

  return (
    <div className="flex h-screen min-h-[500px] w-full min-w-[600px] items-center justify-center">
      <div
        className={clsx(
          'absolute inset-[-100px] z-0 blur-md filter',
          styles.bg,
        )}
      ></div>
      <div className="relative z-[1] flex flex-col space-y-4">
        <Avatar className="" isBordered src={data?.avatar || ''} size="lg" />
      </div>
    </div>
  )
}
