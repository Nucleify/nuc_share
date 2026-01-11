import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useShareSelection } from 'atomic'

describe('useShareSelection', (): void => {
  const mockItems = ref([{ id: 1 }, { id: 2 }, { id: 3 }])

  beforeEach((): void => {
    mockItems.value = [{ id: 1 }, { id: 2 }, { id: 3 }]
  })

  it('initializes with empty selection', (): void => {
    const { selected, isAllSelected, isIndeterminate } =
      useShareSelection(mockItems)

    expect(selected.value).toEqual({})
    expect(isAllSelected.value).toBe(false)
    expect(isIndeterminate.value).toBe(false)
  })

  it('toggle selects and deselects item', (): void => {
    const { toggle, isSelected } = useShareSelection(mockItems)

    expect(isSelected(1)).toBe(false)

    toggle(1)
    expect(isSelected(1)).toBe(true)

    toggle(1)
    expect(isSelected(1)).toBe(false)
  })

  it('selectAll selects all items', (): void => {
    const { selectAll, isAllSelected, isSelected } =
      useShareSelection(mockItems)

    selectAll()

    expect(isAllSelected.value).toBe(true)
    expect(isSelected(1)).toBe(true)
    expect(isSelected(2)).toBe(true)
    expect(isSelected(3)).toBe(true)
  })

  it('deselectAll clears selection', (): void => {
    const { selectAll, deselectAll, isAllSelected, isSelected } =
      useShareSelection(mockItems)

    selectAll()
    expect(isAllSelected.value).toBe(true)

    deselectAll()
    expect(isAllSelected.value).toBe(false)
    expect(isSelected(1)).toBe(false)
    expect(isSelected(2)).toBe(false)
    expect(isSelected(3)).toBe(false)
  })

  it('toggleAll selects all when none selected', (): void => {
    const { toggleAll, isAllSelected } = useShareSelection(mockItems)

    toggleAll()
    expect(isAllSelected.value).toBe(true)
  })

  it('toggleAll deselects all when all selected', (): void => {
    const { selectAll, toggleAll, isAllSelected } = useShareSelection(mockItems)

    selectAll()
    expect(isAllSelected.value).toBe(true)

    toggleAll()
    expect(isAllSelected.value).toBe(false)
  })

  it('isIndeterminate is true when some but not all selected', (): void => {
    const { toggle, isIndeterminate, isAllSelected } =
      useShareSelection(mockItems)

    toggle(1)
    expect(isIndeterminate.value).toBe(true)
    expect(isAllSelected.value).toBe(false)

    toggle(2)
    expect(isIndeterminate.value).toBe(true)

    toggle(3)
    expect(isIndeterminate.value).toBe(false)
    expect(isAllSelected.value).toBe(true)
  })

  it('getSelectedItems returns selected items', (): void => {
    const { toggle, getSelectedItems } = useShareSelection(mockItems)

    toggle(1)
    toggle(3)

    const selectedItems = getSelectedItems<{ id: number }>()
    expect(selectedItems).toHaveLength(2)
    expect(selectedItems.map((i) => i.id)).toEqual([1, 3])
  })

  it('clear removes all selections', (): void => {
    const { selectAll, clear, isAllSelected } = useShareSelection(mockItems)

    selectAll()
    expect(isAllSelected.value).toBe(true)

    clear()
    expect(isAllSelected.value).toBe(false)
  })

  it('handles empty items array', (): void => {
    const emptyItems = ref<{ id: number }[]>([])
    const { isAllSelected, isIndeterminate, selectAll, getSelectedItems } =
      useShareSelection(emptyItems)

    expect(isAllSelected.value).toBe(false)
    expect(isIndeterminate.value).toBe(false)

    selectAll()
    expect(getSelectedItems()).toEqual([])
  })

  it('handles undefined items', (): void => {
    const undefinedItems = ref<{ id: number }[] | undefined>(undefined)
    const { isAllSelected, isIndeterminate, selectAll, getSelectedItems } =
      useShareSelection(undefinedItems)

    expect(isAllSelected.value).toBe(false)
    expect(isIndeterminate.value).toBe(false)

    selectAll()
    expect(getSelectedItems()).toEqual([])
  })
})
