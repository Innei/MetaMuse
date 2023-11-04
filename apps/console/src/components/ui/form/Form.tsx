import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { produce } from 'immer'
import { atom } from 'jotai'
import { useEventCallback } from 'usehooks-ts'
import type {
  DetailedHTMLProps,
  FC,
  FormHTMLAttributes,
  PropsWithChildren,
} from 'react'
import type { Field } from './types'

import { useRefValue } from '~/hooks/common/use-ref-value'
import { useI18n } from '~/i18n/hooks'
import { jotaiStore } from '~/lib/store'

import { Button } from '../button'
import { FormConfigContext, FormContext, useForm } from './FormContext'

interface FormExtendProps {
  showErrorMessage?: boolean
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, result: any) => void
  initialValues?: Record<string, any>
}

type FormProps = PropsWithChildren<
  Omit<
    DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>,
    'onSubmit'
  > &
    FormExtendProps
>

export interface FormForwardRef {
  setValue: (key: string, value: any) => void
}
export const Form = forwardRef<FormForwardRef, FormProps>(
  (props: FormProps, ref) => {
    const { showErrorMessage = true, initialValues, ...formProps } = props
    const fieldsAtom = useRefValue(() => atom({}))

    useEffect(() => {
      if (!initialValues) return

      const fields = jotaiStore.get(fieldsAtom)
      for (const [key, value] of Object.entries(initialValues)) {
        if (fields[key]) {
          fields[key].$ref.value = value
        }
      }
    }, [])

    useImperativeHandle(ref, () => ({
      setValue: (key: string, value: any) => {
        try {
          jotaiStore.get(fieldsAtom)[key].$ref.value = value
        } catch (e) {
          console.error('setValue error', e)
        }
      },
    }))

    return (
      <FormContext.Provider
        value={useRefValue(() => ({
          showErrorMessage,
          fields: fieldsAtom,
          getField: (name: string) => {
            return jotaiStore.get(fieldsAtom)[name]
          },
          addField: (name: string, field: Field) => {
            jotaiStore.set(fieldsAtom, (p) => {
              return {
                ...p,
                [name]: field,
              }
            })
          },

          removeField: (name: string) => {
            jotaiStore.set(fieldsAtom, (p) => {
              const pp = { ...p }

              delete pp[name]
              return pp
            })
          },
        }))}
      >
        <FormConfigContext.Provider
          value={useMemo(() => ({ showErrorMessage }), [showErrorMessage])}
        >
          <FormInternal {...formProps} />
        </FormConfigContext.Provider>
      </FormContext.Provider>
    )
  },
)

Form.displayName = 'Form'

const FormInternal = (props: FormProps) => {
  const { onSubmit, ...rest } = props
  const fieldsAtom = useForm().fields
  const handleSubmit = useEventCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const fields = jotaiStore.get(fieldsAtom)

      const result = {} as any
      for await (const [key, field] of Object.entries(fields)) {
        const $ref = field.$ref
        if (!$ref) continue
        const value = $ref.value
        const rules = field.rules
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i]
          if ($ref.required && !value) {
            $ref.focus()
            return
          }
          try {
            const isOk = await rule.validator(value)
            if (!isOk) {
              console.error(
                `Form validation failed, at field \`${key}\`` +
                  `, got value \`${value}\``,
              )
              $ref.focus()
              if (rule.message) {
                jotaiStore.set(fieldsAtom, (prev) => {
                  return produce(prev, (draft) => {
                    ;(draft[key] as Field).rules[i].status = 'error'
                  })
                })
              }
              return
            }
          } catch (e) {
            console.error('validate function throw error', e)
            return
          }
        }
        if (field.emptyAsNull && !value) {
          result[key] = null
        } else {
          result[key] = value
        }
      }

      onSubmit?.(e, result)
    },
  )
  return (
    <form onSubmit={handleSubmit} {...rest}>
      {props.children}
    </form>
  )
}

export const FormSubmit: FC<{}> = () => {
  const t = useI18n()
  return (
    <Button type="submit" className="inline-block !rounded-lg" color="primary">
      {t('common.submit')}
    </Button>
  )
}
