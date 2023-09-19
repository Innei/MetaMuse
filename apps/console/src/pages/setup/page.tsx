import { Button, Input } from '@nextui-org/react'
import { useForceUpdate } from 'framer-motion'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

import { UserRegisterDto } from '@core/modules/user/dtos/register.dto'

import { Background } from '~/components/ui/Background'
import { useUncontrolledInput } from '~/hooks/use-uncontrolled-input'
import { $axios } from '~/lib/request'
import { router } from '~/router'

export default function SetupPage() {
  // TODO
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Background />

      <div className="modal-card sm relative z-[1] m-auto overflow-hidden rounded-lg bg-white px-6 py-8 shadow-md dark:bg-neutral-900">
        <RegisterStep />
      </div>
    </div>
  )
}

const RegisterStep = () => {
  const [, username, usernameRef] = useUncontrolledInput('')
  const [, password, passwordRef] = useUncontrolledInput('')
  const [, passwordConfirm, passwordConfirmRef] = useUncontrolledInput('')
  const [, email, emailRef] = useUncontrolledInput('')
  const [, nickname, nicknameRef] = useUncontrolledInput('')

  const [update] = useForceUpdate()
  const isPasswordConfirmValid = () => passwordConfirm() === password()

  const { trigger } = useSWRMutation('/user', async () => {
    const payload = {
      username: username(),
      password: password(),
      mail: email(),
      name: nickname(),
      url: null,
      avatar: null,
      introduce: null,
    }

    return $axios
      .post('/user/register', payload as UserRegisterDto)
      .catch((err) => {
        toast.error(err.message)
      })
      .then(() => {
        router.navigate('/login')
      })
  })
  const handleRegister = async () => {
    update()

    if (!isPasswordConfirmValid()) return
    trigger()
  }

  return (
    <div>
      <h1 className="mb-6 text-center text-lg font-bold">
        第一步，先登记一下吧
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleRegister()
        }}
        className="flex flex-col space-y-4"
      >
        <Input size="sm" label={'你的名字 (登录凭证)'} ref={usernameRef} />
        <Input size="sm" label={'昵称'} ref={nicknameRef} />
        <Input size="sm" label={'邮箱'} ref={emailRef} />
        <Input size="sm" type="password" label={'密码'} ref={passwordRef} />
        <Input
          size="sm"
          type="password"
          label={'确认密码'}
          isInvalid={!isPasswordConfirmValid()}
          errorMessage={isPasswordConfirmValid() ? '' : '两次输入的密码不一致'}
          ref={passwordConfirmRef}
        />
        <button type="submit" className="hidden" />
      </form>
      <div className="mt-8 flex items-center justify-center">
        <Button variant="shadow" color="primary" onClick={handleRegister}>
          登录
        </Button>
      </div>
    </div>
  )
}
