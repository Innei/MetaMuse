import { omit } from 'lodash'

type DefaultKeys = 'id' | 'created' | 'modified' | 'deleted'
const defaultProjectKeys = ['id', 'created', 'modified', 'deleted'] as const

type Projection<K extends string | number | symbol> = {
  [P in K]: true
}

type SerializedProjection<T extends object, K extends keyof T> = {
  keys: K[]
  serialize: (obj: T) => Omit<T, K>
}

export function createProjectionOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  withDefaults: true,
): Projection<K | DefaultKeys> & {
  keys: (K | DefaultKeys)[]
  serialize: <T extends object>(obj: T) => Omit<T, K | DefaultKeys>
}
export function createProjectionOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Projection<K> & {
  keys: K[]
  serialize: <T extends object>(obj: T) => Omit<T, K>
}

export function createProjectionOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  withDefaults: boolean = false,
): any {
  const projection: Partial<Projection<K | DefaultKeys>> = {}

  // Add default keys if withDefaults is true
  if (withDefaults) {
    defaultProjectKeys.forEach((key) => {
      projection[key] = true
    })
  }

  // Add specified keys
  for (const key of keys) {
    projection[key] = true
  }

  // @ts-ignore
  projection.keys = [...keys, ...(withDefaults ? defaultProjectKeys : [])]
  // @ts-ignore
  projection.serialize = (obj: T) => {
    return omit(obj, [...keys, ...(withDefaults ? defaultProjectKeys : [])])
  }

  return projection as any
}
