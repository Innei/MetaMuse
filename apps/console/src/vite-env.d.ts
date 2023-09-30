/// <reference types="vite/client" />

type StringifyNestedDates<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends object
    ? StringifyNestedDates<T[K]>
    : T[K]
}
