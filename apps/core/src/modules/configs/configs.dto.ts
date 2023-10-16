export class SeoDto {
  title: string

  description: string

  keywords?: string[]
}
export class UrlDto {
  webUrl: string

  adminUrl: string

  serverUrl: string

  wsUrl: string
}

export class MailOptions {
  port: number
  host: string
  user: string
  password: string
  secure: boolean
  enable: boolean
}
