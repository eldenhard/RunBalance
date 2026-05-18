<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger'
  class?: string
}>(), {
  variant: 'default'
})

const variantClass = computed(() => ({
  default: 'bg-slate-950 text-white',
  secondary: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800'
}[props.variant]))
</script>

<template>
  <span :class="cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', variantClass, props.class)">
    <slot />
  </span>
</template>

