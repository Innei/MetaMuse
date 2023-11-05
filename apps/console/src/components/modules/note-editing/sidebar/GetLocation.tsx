import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'

import { input } from '@nextui-org/theme'

import { Button, ButtonGroup, Input } from '~/components/ui'
import { Autocomplete } from '~/components/ui/auto-completion'
import { useCurrentModal } from '~/components/ui/modal/stacked/context'
import { useModalStack } from '~/components/ui/modal/stacked/provider'
import { APP_SCOPE } from '~/constants/app'
import { useI18n } from '~/i18n/hooks'
import { $axios } from '~/lib/request'
import { trpc } from '~/lib/trpc'

import { useNoteModelSingleFieldAtom } from '../data-provider'

const styles = input({ variant: 'faded', size: 'sm' })

export const GetLocation = () => {
  const t = useI18n()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useNoteModelSingleFieldAtom('location')
  const [coordinates, setCoordinates] =
    useNoteModelSingleFieldAtom('coordinates')

  const GetGeo = () =>
    new Promise<GeolocationPosition>((r, j) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(true)
          r(pos)
          setLoading(false)
        },
        (err) => {
          setLoading(false)
          j(err)
        },
      )
    })

  const handleGetGeo = async () => {
    if (!navigator.geolocation) {
      toast.error(t('module.notes.not_support_location'))
      return
    }

    try {
      const coordinates = await GetGeo()

      const {
        coords: { latitude, longitude },
      } = coordinates

      const coo = [longitude, latitude] as const
      setCoordinates(coo)
      // TODO api fetch info location
    } catch (e: any) {
      console.error(e)

      if (e.code == 2) {
        toast.error(t('common.timeout'))
      } else {
        toast.error(t('module.notes.location_permission_denied'))
      }
    }
  }

  const { present } = useModalStack()
  const handleCustomSearch = useEventCallback(() => {
    present({
      title: t('module.notes.search_location'),
      content: LocationSearchModal,
    })
  })

  return (
    <div className="justify-between flex-wrap flex items-center">
      <label
        className={styles.label({
          className: 'flex-shrink-0',
        })}
      >
        {t('module.notes.get_current_location')}
      </label>
      <ButtonGroup className="flex-shrink-0" variant="outline">
        <Button
          rounded
          isLoading={loading}
          className="flex items-center"
          onClick={handleGetGeo}
        >
          <i className="icon-[mingcute--location-line] mr-1" />
          {t('module.notes.location')}
        </Button>
        <Button
          rounded
          iconOnly
          isLoading={loading}
          onClick={handleCustomSearch}
        >
          <i className="icon-[mingcute--search-2-line]" />
        </Button>
        <Button
          rounded
          iconOnly
          isLoading={loading}
          color="destructive"
          onClick={() => {
            setLocation(null)
            setCoordinates(null)
          }}
        >
          <i className="icon-[mingcute--delete-back-line]" />
        </Button>
      </ButtonGroup>
    </div>
  )
}

const LocationSearchModal = () => {
  const { dismiss } = useCurrentModal()
  const Key = 'amap_token'
  const { data: token, isLoading } = trpc.configs.kv.get.useQuery({
    key: Key,
    scope: APP_SCOPE,
  })

  const { mutateAsync, isLoading: updateTokenPending } =
    trpc.configs.kv.set.useMutation({})

  const [tokenValue, setTokenValue] = useState(token)

  useEffect(() => {
    if (token) setTokenValue(JSON.parse(token))
  }, [token])

  const utils = trpc.useUtils()

  const [searchValue, setSearchValue] = useState('')

  const { data: searchResule } = useQuery({
    queryKey: ['amap', searchValue],
    keepPreviousData: true,

    queryFn: async ({ signal }) => {
      if (!searchValue) return
      if (!tokenValue) return
      const data = await searchByKeyword({
        keywords: searchValue,
        token: tokenValue,

        signal,
      })
      return data
    },
  })
  console.log(searchResule)

  const t = useI18n()
  // TODO
  return (
    <div className="max-w-[100vw] w-[400px] flex flex-col">
      <Autocomplete
        suggestions={[]}
        onChange={(e) => {
          setSearchValue(e.target.value)
        }}
        onSuggestionSelected={() => {}}
      />

      <div className="flex items-center gap-2 mt-4 w-full">
        <Input
          className="flex-grow"
          isLoading={isLoading}
          type="password"
          placeholder={t('module.notes.amap_key_required')}
          value={tokenValue}
          onChange={(e) => setTokenValue(e.target.value)}
        />
        <Button
          className="flex-shrink-0"
          isLoading={updateTokenPending}
          onClick={() => {
            mutateAsync({
              key: Key,
              scope: APP_SCOPE,
              value: tokenValue,
              encrypt: true,
            })
              .catch((e) => {
                toast.error(e.message)
              })
              .then(() => {
                toast.success(t('common.save-success'))
                utils.configs.kv.get.setData(
                  {
                    key: Key,
                    scope: APP_SCOPE,
                  },
                  JSON.stringify(tokenValue),
                )
              })
          }}
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}

const getAmapData = async ({
  latitude,
  longitude,

  token,
}: {
  latitude: number
  longitude: number
  token: string
}) => {
  const { data } = await $axios
    .get(
      `https://restapi.amap.com/v3/geocode/regeo?key=${token}&location=` +
        `${longitude},${latitude}`,
    )
    .catch(() => null)

  if (!data) {
    toast.error('获取位置信息失败')
    return
  }
  return data
}

const searchByKeyword = async ({
  keywords,
  token,

  signal,
}: {
  keywords: string
  token: string

  signal?: AbortSignal
}) => {
  const params = new URLSearchParams([
    ['key', token],
    ['keywords', keywords],
  ])

  const { data } = await $axios
    .get(`https://restapi.amap.com/v3/place/text?${params.toString()}`, {
      signal,
    })
    .catch(() => null)

  return data
}
