import { cloneDeep as _clone } from 'lodash-es'

export const cloneDeep = <T>(obj: T): T =>
  'structuredClone' in window ? structuredClone(obj) : _clone(obj)
