import type { JSX, SyntheticEvent } from 'react'

import type { NucShareCheckboxInterface } from 'nucleify'
import { AdCheckbox } from 'nucleify'

export function NucShareCheckbox({
  adType,
  checked,
  indeterminate,
  isAll,
  onToggle,
}: NucShareCheckboxInterface): JSX.Element {
  const stopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation()
  }

  return (
    <AdCheckbox
      adType={adType}
      checked={checked ?? false}
      indeterminate={isAll ? indeterminate : undefined}
      onClick={stopPropagation}
      onChange={(event) => {
        event.originalEvent?.stopPropagation()
        onToggle?.()
      }}
    />
  )
}
