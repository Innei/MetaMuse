import { Avatar, Input } from '@nextui-org/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@model'
import clsx from 'clsx'
import { toast } from 'sonner'
import useSWR from 'swr'

import { ErrorCodeEnum } from '@core/constants/error-code.constant'

import { ErrorComponent } from '~/components/common/Error'
import { BizError } from '~/lib/biz-error'
import { clsxm } from '~/lib/helper'
import { $axios } from '~/lib/request'
import { userStore } from '~/store/user'

import styles from './index.module.css'

export default function LoginPage() {
  const { data, error } = useSWR<User>('/user', async () => {
    return $axios.get('/user')
  })

  const nav = useNavigate()
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (password.length === 0) return
    await userStore.login(data!.username, password).catch((err) => {
      if (err instanceof BizError) {
        toast.error(err.chMessage || err.message)
      }
      throw err
    })
  }

  if (error && error instanceof BizError) {
    if (error.code === ErrorCodeEnum.NotInitialized) {
      nav('/setup')
    }
  }

  if (error) {
    return <ErrorComponent errorText={error.message} />
  }

  return (
    <div className="relative flex h-screen min-h-[500px] w-full min-w-[600px] items-center justify-center">
      <div className="absolute h-full w-full overflow-hidden">
        <div
          className={clsx(
            'absolute inset-[-100px] z-0 blur-md filter',
            styles.bg,
          )}
        ></div>
      </div>
      <form
        className="relative z-[1] flex flex-col items-center space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >
        <Avatar
          className="ring-primary"
          isBordered
          src={data?.avatar || ''}
          size="lg"
        />
        <Input
          type="password"
          classNames={{
            inputWrapper:
              '!bg-slate-50/30 px-3 dark:!bg-slate-900/30 rounded-full backdrop-blur-sm',
          }}
          endContent={
            <button
              onClick={handleLogin}
              className="flex items-center"
              type="submit"
            >
              <i
                className={clsxm(
                  'icon-[mingcute--arrow-right-circle-fill] duration-200',
                  password.length > 0 ? 'opacity-30' : 'opacity-0',
                )}
              />
            </button>
          }
          placeholder=""
          value={password}
          size="sm"
          onChange={(e) => setPassword(e.target.value)}
        />
      </form>
    </div>
  )
}
