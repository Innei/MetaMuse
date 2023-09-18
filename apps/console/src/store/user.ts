import { User } from '@model'
import { makeAutoObservable } from 'mobx'

import { setToken } from '~/lib/cookie'
import { $axios } from '~/lib/request'

class UserStore {
  constructor() {
    makeAutoObservable(this)
  }

  user: User | null = null

  isLogged = false

  async getOwner() {
    const user = await $axios.get<User>('/user')

    this.user = user
    return user
  }

  async login(username: string, password: string) {
    const user = await $axios.post<
      User & {
        authToken: string
      }
    >('/user/login', {
      username,
      password,
    })

    this.user = user
    this.isLogged = true

    setToken(user.authToken)
    return user
  }

  async loginByToken() {
    const { authToken } = await $axios.put<{
      authToken: string
    }>('/user/login')

    this.isLogged = true
    setToken(authToken)
  }
}

export const userStore = new UserStore()
