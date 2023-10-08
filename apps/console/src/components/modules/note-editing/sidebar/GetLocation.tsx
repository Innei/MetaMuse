import { Button, ButtonGroup } from '@nextui-org/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'

import { input } from '@nextui-org/theme'

import { Autocomplete } from '~/components/ui/auto-completion'
import { useI18n } from '~/i18n/hooks'
import {
  useCurrentModal,
  useModalStack,
} from '~/providers/modal-stack-provider'

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
      <ButtonGroup
        size="sm"
        radius="full"
        className="flex-shrink-0"
        variant="ghost"
      >
        <Button
          isLoading={loading}
          className="flex items-center"
          onClick={handleGetGeo}
        >
          <i className="icon-[mingcute--location-line] mr-1" />
          {t('module.notes.location')}
        </Button>
        <Button isIconOnly isLoading={loading} onClick={handleCustomSearch}>
          <i className="icon-[mingcute--search-2-line]" />
        </Button>
        <Button
          isIconOnly
          isLoading={loading}
          // variant="light"
          color="danger"
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

  const t = useI18n()
  // TODO
  return (
    <div className="max-w-[100vw] w-[400px] flex flex-col">
      <Autocomplete
        suggestions={[]}
        onSuggestionSelected={() => {}}
        size="sm"
      />
    </div>
  )
}
