import { Autocomplete } from '~/components/ui/auto-completion'
import { useI18n } from '~/i18n/hooks'

import { MOOD_SET, WEATHER_SET } from '../constants'
import { useNoteModelSingleFieldAtom } from '../data-provider'

export const NoteWeatherAndMood = () => {
  const [weather, setWeather] = useNoteModelSingleFieldAtom('weather')
  const [mood, setMood] = useNoteModelSingleFieldAtom('mood')

  const t = useI18n()
  return (
    <>
      <Autocomplete
        label={t('module.notes.weather')}
        defaultValue={weather}
        suggestions={WEATHER_SET.map((w) => ({ name: w, value: w }))}
        onSuggestionSelected={(suggestion) => {
          setWeather(suggestion.value)
        }}
        placeholder=" "
        labelPlacement="outside"
        size="sm"
        onConfirm={(value) => {
          setWeather(value)
        }}
      />

      <Autocomplete
        placeholder=" "
        labelPlacement="outside"
        label={t('module.notes.mood')}
        size="sm"
        defaultValue={mood}
        suggestions={MOOD_SET.map((w) => ({ name: w, value: w }))}
        onSuggestionSelected={(suggestion) => {
          setMood(suggestion.value)
        }}
        onConfirm={(value) => {
          setMood(value)
        }}
      />
    </>
  )
}
