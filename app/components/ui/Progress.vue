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
  <div class="h-1.5 overflow-hidden rounded-full bg-[#ececea] dark:bg-[#252525]">
    <div class="h-full rounded-full bg-[#111111] transition-all dark:bg-white" :style="{ width }" />
  </div>
</template>

