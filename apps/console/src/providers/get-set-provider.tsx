import { createContext, PropsWithChildren, useContext } from 'react'

interface Props<T> {
  value: T
  setter: ((value: T) => void) | ((valueFn: (value: T) => T) => void)
}

const ValueContext = createContext<any>(null)
const SetterContext = createContext<any>(null)

const GetSetProvider = function <T>(props: PropsWithChildren<Props<T>>) {
  const { setter, value } = props

  return (
    <SetterContext.Provider value={setter}>
      <ValueContext.Provider value={value}>
        {props.children}
      </ValueContext.Provider>
    </SetterContext.Provider>
  )
}

export const createGetSetProvider = <T, F extends Function>(
  value: T,
  setter: F,
) => {
  return [
    GetSetProvider,
    () => useContext(ValueContext),
    () => useContext(SetterContext),
  ]
}
