import { MailOptions, SeoDto, UrlDto } from './configs.dto'

export interface IConfig {
  url: UrlDto
  seo: SeoDto
  mailOptions: MailOptions
}
