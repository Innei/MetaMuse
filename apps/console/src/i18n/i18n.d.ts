// import the original type declarations
import 'i18next'

// import all namespaces (for the default language, only)
import en from './en.json'
import zh from './zh.json'

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      en: typeof en
      zh: typeof zh
    }
    // other
  }
}
export {}
