/// <reference types="vite/client" />

type StringifyNestedDates<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends null
      ? null
      : T[K] extends Date | null
        ? string | null
        : T[K] extends object
          ? StringifyNestedDates<T[K]>
          : T[K]
}
