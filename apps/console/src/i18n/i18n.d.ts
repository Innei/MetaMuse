import { i18nResources } from './resources'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'en'
    resources: typeof i18nResources
  }
}
