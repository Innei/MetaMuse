import { t } from 'i18next'
import { z } from 'zod'
import type { Rule } from './types'

export const stringRuleMin = (min: number): Rule<string> => {
  return {
    message: t('validator.min_length', { min }),
    validator: (value) => value.length >= min,
  }
}

export const stringRuleMax = (max: number): Rule<string> => {
  return {
    message: t('validator.max_length', { max }),
    validator: (value) => value.length < max,
  }
}

export const stringRuleUrl = ({
  optional,
}: { optional?: boolean } = {}): Rule<string> => {
  return {
    message: t('validator.url'),
    validator: (value) => {
      if (optional && !value) return true
      return z.string().url().safeParse(value).success
    },
  }
}
