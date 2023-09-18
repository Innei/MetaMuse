import { User } from '@model'
import { makeAutoObservable } from 'mobx'

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
    const user = await $axios.post<User>('/user/login', {
      username,
      password,
    })

    this.user = user
    this.isLogged = true
    return user
  }

  async loginByToken(token: string) {
    const user = await $axios.put<User>('/user/login', {
      token,
    })

    this.user = user
    this.isLogged = true
    return user
  }
}

export const userStore = new UserStore()
