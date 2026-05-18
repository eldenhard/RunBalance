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
  <div class="h-1.5 overflow-hidden rounded-full bg-[var(--screen-surface-muted)]">
    <div class="h-full rounded-full bg-[var(--screen-foreground)] transition-all" :style="{ width }" />
  </div>
</template>
