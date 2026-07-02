<template>
  <ad-checkbox
    :nui-type="props.nuiType"
    :model-value="props.checked"
    :indeterminate="props.isAll ? props.indeterminate : undefined"
    :binary="true"
    @change="$emit('toggle')"
  />
</template>

<script setup lang="ts">
import type { NucShareCheckboxInterface } from 'nucleify'

const props = defineProps<NucShareCheckboxInterface>()

defineEmits(['toggle'])
</script>
