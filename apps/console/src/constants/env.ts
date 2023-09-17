export const API_URL = (() => {
  const url =
    parseUrlencode(new URLSearchParams(location.search).get('__api')) ||
    localStorage.getItem('__api') ||
    window.injectData.BASE_API ||
    (import.meta.env.VITE_APP_BASE_API as string) ||
    '/api'

  return url.endsWith('/') ? url.slice(0, -1) : url
})()

function parseUrlencode(url: string | null) {
  return url ? decodeURIComponent(url) : null
}
