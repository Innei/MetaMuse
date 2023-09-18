import { Avatar, Input } from '@nextui-org/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@model'
import clsx from 'clsx'
import { toast } from 'sonner'
import useSWR from 'swr'
import useMutation from 'swr/mutation'

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

  const { trigger: login } = useMutation('/user', async (key) => {
    return userStore.login(data!.username, password)
  })

  const nav = useNavigate()
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (password.length === 0) return
    await login().catch((err) => {
      if (err instanceof BizError) {
        toast.error(err.chMessage || err.message)
      }
      throw err
    })

    nav('/dashboard', { replace: true })
  }

  useEffect(() => {
    document.addEventListener('keydown', () => {})
  }, [])

  const ref = useRef(null)

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
          ref={ref}
          autoFocus
          endContent={
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleLogin()
              }}
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
