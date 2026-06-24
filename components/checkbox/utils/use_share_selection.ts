import { computed, type Ref, ref } from 'vue'

export interface UseShareSelectionReturn {
  selected: Ref<Record<number, boolean>>
  isSelected: (id: number) => boolean
  isAllSelected: Ref<boolean>
  isIndeterminate: Ref<boolean>
  toggle: (id: number) => void
  toggleAll: () => void
  selectAll: () => void
  deselectAll: () => void
  getSelectedItems: <T extends { id: number }>() => T[]
  clear: () => void
}

export function useShareSelection(
  items: Ref<{ id: number }[] | undefined>
): UseShareSelectionReturn {
  const selected = ref<Record<number, boolean>>({})

  const selectedCount = computed(() => {
    return Object.values(selected.value).filter(Boolean).length
  })

  const isAllSelected = computed(() => {
    const itemsValue = items.value
    if (!itemsValue || itemsValue.length === 0) return false
    return itemsValue.every((item) => selected.value[item.id] === true)
  })

  const isIndeterminate = computed(() => {
    const count = selectedCount.value
    const itemsValue = items.value
    if (!itemsValue || itemsValue.length === 0) return false
    return count > 0 && count < itemsValue.length
  })

  const isSelected = (id: number): boolean => {
    return selected.value[id] === true
  }

  const toggle = (id: number): void => {
    selected.value = {
      ...selected.value,
      [id]: !selected.value[id],
    }
  }

  const selectAll = (): void => {
    const itemsValue = items.value
    if (!itemsValue) return

    const newSelected: Record<number, boolean> = {}
    itemsValue.forEach((item) => {
      newSelected[item.id] = true
    })
    selected.value = newSelected
  }

  const deselectAll = (): void => {
    selected.value = {}
  }

  const toggleAll = (): void => {
    if (isAllSelected.value) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  const getSelectedItems = <T extends { id: number }>(): T[] => {
    const itemsValue = items.value as T[] | undefined
    if (!itemsValue) return []
    return itemsValue.filter((item) => selected.value[item.id] === true)
  }

  const clear = (): void => {
    selected.value = {}
  }

  return {
    selected,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggle,
    toggleAll,
    selectAll,
    deselectAll,
    getSelectedItems,
    clear,
  }
}
