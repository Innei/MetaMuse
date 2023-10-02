import { tv } from '@nextui-org/react'

import { input } from '@nextui-org/theme'

import { clsxm } from '~/lib/helper'

const inputStyles = input()
export const styles = tv({
  slots: {
    label: clsxm(inputStyles.label, 'w-[80px]'),
  },
})
