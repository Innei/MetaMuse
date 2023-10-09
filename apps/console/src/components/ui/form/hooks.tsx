import { useCallback, useEffect } from 'react'
import { produce } from 'immer'
import { useAtomValue, useStore } from 'jotai'
import { selectAtom } from 'jotai/utils'
import type { RefObject } from 'react'
import type { Rule } from './types'

import { useForm } from './FormContext'

export const useValidateInput = ({
  rules,
  name,
  inputRef,
  emptyAsNull,
}: {
  rules?: Rule<string>[]
  name: string
  inputRef: RefObject<HTMLInputElement>
  emptyAsNull: boolean
}) => {
  const FormCtx = useForm()
  if (!FormCtx) throw new Error('FormInput must be used inside <FormContext />')
  const { addField, removeField, fields } = FormCtx
  const errorMessage = useAtomValue(
    selectAtom(
      fields,
      useCallback(
        (atomValue) => {
          if (!name) return
          return atomValue[name]?.rules.find((rule) => rule.status === 'error')
            ?.message
        },
        [name],
      ),
    ),
  )
  useEffect(() => {
    if (!rules) return
    if (!name) return

    addField(name, {
      rules,
      $ref: inputRef.current,
      emptyAsNull,
    })

    return () => {
      removeField(name)
    }
  }, [name, rules])
  const jotaiStore = useStore()
  const onKeyDown = useCallback(() => {
    jotaiStore.set(fields, (p) => {
      return produce(p, (draft) => {
        if (!name) return
        draft[name].rules.forEach((rule) => {
          if (rule.status === 'error') rule.status = 'success'
        })
      })
    })
  }, [fields, jotaiStore, name])

  const onBlur = useCallback(async () => {
    if (!rules) return
    for (const rule of rules) {
      const valid = await rule.validator(inputRef.current?.value || '')

      if (!valid) {
        jotaiStore.set(fields, (p) => {
          return produce(p, (draft) => {
            if (!draft[name]) return draft
            const index = p[name].rules.findIndex((r) => r === rule)

            if (index === -1) return draft
            draft[name].rules[index].status = 'error'
          })
        })
        break
      }
    }
  }, [fields, inputRef, jotaiStore, name, rules])

  return {
    onKeyDown,
    errorMessage,
    FormCtx,
    onBlur,
  }
}
