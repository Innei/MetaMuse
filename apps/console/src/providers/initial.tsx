import { useQuery } from '@tanstack/react-query'
import type { FC, PropsWithChildren} from 'react';
import { createContext, useContext } from 'react'

import { Error } from '~/components/common/Error'
import { PageLoading } from '~/components/common/PageLoading'

interface InitialData {
  seo: {
    title: string
  }
}

const InitialDataContext = createContext<InitialData>(null! as InitialData)
export const InitialDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data, error, isLoading } = useQuery(['initial-data'], async () => {
    return {
      seo: {
        title: '静かな森',
      },
    } as InitialData
  })

  if (isLoading) {
    return (
      <PageLoading
        className="h-screen min-h-[300px]"
        loadingText="获取初始数据..."
      />
    )
  }

  if (error) {
    return (
      <Error
        errorText="获取初始数据失败，请检查网络连接或刷新页面重试。"
        className="h-screen min-h-[300px]"
      />
    )
  }

  return (
    <InitialDataContext.Provider value={data! as InitialData}>
      {children}
    </InitialDataContext.Provider>
  )
}

export const useAppInitialData = () => {
  return useContext(InitialDataContext)
}
