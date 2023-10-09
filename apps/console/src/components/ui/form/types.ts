export interface Rule<T = unknown> {
  message: string
  validator: (value: T) => boolean | Promise<boolean>
}

type ValidateStatus = 'error' | 'success'
export interface Field {
  rules: (Rule<any> & { status?: ValidateStatus })[]

  emptyAsNull: boolean

  $ref: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null
}

export type FormFieldBaseProps<T> = {
  rules?: Rule<T>[] | Rule<T>
  name: string
}
