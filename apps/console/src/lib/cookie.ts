import Cookies from 'js-cookie'

export const TokenKey = 'mx-token'

/**
 * 带了 bearer
 */
export function getToken(): string | null {
  const token = Cookies.get(TokenKey)
  return token ? `Bearer ${token}` : null
}

export function setToken(token: string) {
  if (typeof token !== 'string') {
    return
  }
  return Cookies.set(TokenKey, token, {
    expires: 14,
  })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
