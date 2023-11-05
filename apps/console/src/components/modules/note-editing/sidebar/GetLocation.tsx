import type { FC} from 'react';
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'

import { input } from '@nextui-org/theme'

import { Button, ButtonGroup, Input, Label } from '~/components/ui'
import type { Suggestion } from '~/components/ui/auto-completion';
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

      setCoordinates({
        latitude,
        longitude,
      })
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
      content: () => (
        <LocationSearchModal
          setCoordinates={setCoordinates}
          setLocation={setLocation}
        />
      ),
    })
  })

  return (
    <div className="flex flex-col">
      <div className="justify-between flex-wrap flex items-center">
        <Label>{t('module.notes.get_current_location')}</Label>
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
      {location && (
        <div className="mt-4">
          {location}

          <p className="mt-2">
            {coordinates?.latitude}, {coordinates?.longitude}
          </p>
        </div>
      )}
    </div>
  )
}

const LocationSearchModal: FC<{
  setLocation: (location: string | null) => void
  setCoordinates: (
    coordinates: { latitude: number; longitude: number } | null,
  ) => void
}> = ({ setCoordinates, setLocation }) => {
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

  const { data: searchResult, isLoading: searchPending } =
    trpc.note.amapSearch.useQuery(
      {
        keywords: searchValue,
        token: tokenValue!,
      },
      {
        keepPreviousData: true,
        enabled: searchValue.length > 0 && !!tokenValue?.length,
      },
    )

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!searchResult) return []

    return searchResult.pois.map((p) => {
      const label = p.cityname + p.adname + p.address + p.name
      const [longitude, latitude] = p.location.split(',').map(Number)
      return {
        name: label,
        value: JSON.stringify([label, { latitude, longitude }]),
      }
    })
  }, [searchResult])

  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion>()

  const t = useI18n()
  // TODO
  return (
    <div className="max-w-[100vw] w-[400px] flex flex-col">
      <div className="flex gap-2">
        <Autocomplete
          className="flex-grow"
          wrapperClassName="flex-grow"
          portal
          isLoading={searchPending && searchValue.length > 0}
          suggestions={suggestions}
          onChange={(e) => {
            setSearchValue(e.target.value)
          }}
          onSuggestionSelected={(suggestion) => {
            if (!suggestion) return
            setSelectedSuggestion(suggestion)
          }}
          onConfirm={(textOnly) => {
            setSelectedSuggestion({
              name: textOnly,
              value: '',
            })
          }}
        />

        <Button
          className="flex-shrink-0"
          onClick={() => {
            if (!selectedSuggestion) {
              dismiss()
              return
            }
            const parsedJsonValue = JSON.parse(
              selectedSuggestion?.value || 'null',
            )
            if (!parsedJsonValue) {
              setLocation(selectedSuggestion.name)
              setCoordinates(null)
            } else {
              const [location, coordinates] = parsedJsonValue
              setLocation(location)
              setCoordinates(coordinates)
            }
            dismiss()
          }}
        >
          {t('common.save')}
        </Button>
      </div>

      <div className="flex-shrink-0 divider text-xs">Token Setting</div>

      <div className="flex items-center gap-2 w-full">
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
