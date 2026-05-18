<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  max?: number
}>(), {
  max: 100
})

const width = computed(() => `${Math.min(100, Math.max(0, (props.value / props.max) * 100))}%`)
</script>

<template>
  <div class="h-2 overflow-hidden rounded-full bg-slate-100">
    <div class="h-full rounded-full bg-slate-950 transition-all" :style="{ width }" />
  </div>
</template>

