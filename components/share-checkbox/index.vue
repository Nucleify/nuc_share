<template>
  <ad-checkbox
    :ad-type="props.adType"
    :model-value="props.checked"
    :indeterminate="props.isAll ? props.indeterminate : undefined"
    :binary="true"
    @change="$emit('toggle')"
  />
</template>

<script setup lang="ts">
import type { NucShareCheckboxInterface } from 'atomic'

const props = defineProps<NucShareCheckboxInterface>()

defineEmits(['toggle'])
</script>

