import { CommentOptionsDto, MailOptions, SeoDto, UrlDto } from './configs.dto'

export interface IConfig {
  url: UrlDto
  seo: SeoDto
  mailOptions: MailOptions
  commentOptions: CommentOptionsDto
}
