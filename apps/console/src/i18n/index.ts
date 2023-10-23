import { initReactI18next } from 'react-i18next'
import { use } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import zh from './zh.json'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
}

export const init18n = () => {
  use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      detection: {
        order: [
          'querystring',
          'navigator',
          'cookie',
          'localStorage',
          'sessionStorage',
          'htmlTag',
        ],
        lookupQuerystring: 'lang',
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18nextLng',
        lookupSessionStorage: 'i18nextLng',

        // cache user language
        caches: ['localStorage'],
        excludeCacheFor: ['cimode'],
      },

      fallbackLng: 'en',
      debug: true,
      resources,
      // lng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
      // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
      // if you're using a language detector, do not define the lng option

      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    })
}
