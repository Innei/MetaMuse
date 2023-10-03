import { useMutation, useQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useStore } from 'jotai'
import type { User } from '@model'

import { setToken } from '~/lib/cookie'
import { $axios } from '~/lib/request'
import { jotaiStore } from '~/lib/store'

const userAtom = atom<User | null>(null)
const isLoggedAtom = atom(false)

export const useUser = () => {
  return useQuery({
    queryFn: () => $axios.get<User>('/user') as any as User,
    queryKey: ['user'],
  }).data
}

export const syncUser = async () => {
  const user = await $axios.get<User>('/user').then((data) => data.data)
  jotaiStore.set(userAtom, user)
}

export const useLogin = () => {
  const store = useStore()
  const login = async (data: { username: string; password: string }) => {
    const { username, password } = data
    const user = await $axios.post<
      User & {
        authToken: string
      }
    >('/user/login', {
      username,
      password,
    })

    store.set(userAtom, user)
    store.set(isLoggedAtom, true)

    setToken(user.authToken)
    return user
  }
  return useMutation({
    mutationFn: login,
  })
}

export const loginByToken = async () => {
  const { authToken } = (await $axios.put('/user/login', undefined, {
    ignoreBizError: true,
  })) as {
    authToken: string
  }

  setToken(authToken)
  jotaiStore.set(isLoggedAtom, true)
}

export const isLogged = () => jotaiStore.get(isLoggedAtom)

export const useIsLogged = () => useAtomValue(isLoggedAtom)
