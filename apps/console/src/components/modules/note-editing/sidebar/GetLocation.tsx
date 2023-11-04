import { useState } from 'react'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'

import { input } from '@nextui-org/theme'

import { Button, ButtonGroup } from '~/components/ui'
import { Autocomplete } from '~/components/ui/auto-completion'
import { useCurrentModal } from '~/components/ui/modal/stacked/context'
import { useModalStack } from '~/components/ui/modal/stacked/provider'
import { useI18n } from '~/i18n/hooks'

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
