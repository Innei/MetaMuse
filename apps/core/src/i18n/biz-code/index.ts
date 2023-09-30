import { ErrorCodeEnum } from '@core/constants/error-code.constant'

import zh from './zh'

const langMap = { zh, 'zh-CN': zh }

export function errorMessageFor(
  code: ErrorCodeEnum,
  language: keyof typeof langMap,
): string
// @ts-expect-error
export function errorMessageFor(
  code: ErrorCodeEnum,
  language: string,
): string | undefined
export function errorMessageFor(
  code: ErrorCodeEnum,
  language: keyof typeof langMap,
): string | undefined {
  return langMap[language]?.[code]
}
