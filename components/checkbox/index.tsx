import type { JSX, SyntheticEvent } from 'react'

import type { NucShareCheckboxInterface } from 'nucleify'
import { AdCheckbox } from 'nucleify'

export function NucShareCheckbox({
  nuiType,
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
      nuiType={nuiType}
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
