import { useMemo } from 'react'
import type { ButtonVariant } from './styled'

import { clsxm } from '~/lib/helper'

import {
  ButtonGroupAtomContext,
  ButtonGroupContext,
  createButtonGroupAtomContext,
} from './ButtonGroupContext'

export const ButtonGroup: Component<ButtonVariant> = (props) => {
  const { children, className, size, variant } = props
  return (
    <ButtonGroupContext.Provider
      value={useMemo(
        () => ({
          size,
          variant,
        }),
        [size, variant],
      )}
    >
      <ButtonGroupAtomContext.Provider
        value={useMemo(createButtonGroupAtomContext, [])}
      >
        <div className={clsxm('inline-flex', className)} data-button-group>
          {props.children}
        </div>
      </ButtonGroupAtomContext.Provider>
    </ButtonGroupContext.Provider>
  )
}
