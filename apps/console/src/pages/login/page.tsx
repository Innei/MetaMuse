import { Avatar } from '@nextui-org/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { BizError } from '~/lib/biz-error'
import { clsxm } from '~/lib/helper'
import { useLogin, useUser } from '~/store/user'

import { Background } from '../../components/ui/background'

export default function LoginPage() {
  const user = useUser()

  const { mutateAsync: login } = useLogin()

  const nav = useNavigate()
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!user) return
    if (password.length === 0) return
    await login({
      password,
      username: user.username,
    }).catch((err) => {
      if (err instanceof BizError) {
        toast.error(err.message)
      }
      throw err
    })

    nav('/dashboard', { replace: true })
  }

  useEffect(() => {
    const handler = () => {
      ref.current?.focus()
    }

    handler()
    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [])

  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="relative flex h-screen min-h-[500px] w-full min-w-[600px] items-center justify-center">
      <Background />
      <form
        className="relative z-[1] flex flex-col items-center space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Avatar
          className="ring-primary"
          isBordered
          src={user?.avatar || ''}
          size="lg"
        />

        <div className="relative flex h-[35px] space-x-2 rounded-full bg-slate-50/50 px-3 py-2 backdrop-blur-sm dark:bg-slate-900/40">
          <input
            ref={ref}
            className="h-full flex-grow appearance-none border-0 bg-transparent outline-none ring-0"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <div className="flex flex-shrink-0 items-center justify-center">
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
          </div>
        </div>
      </form>
    </div>
  )
}
