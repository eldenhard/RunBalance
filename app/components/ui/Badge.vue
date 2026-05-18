<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger'
  class?: string
}>(), {
  variant: 'default'
})

const variantClass = computed(() => ({
  default: 'bg-[#111111] text-white',
  secondary: 'bg-[#f0f0ed] text-[#555]',
  success: 'bg-[#e8efe5] text-[#2f6b31]',
  warning: 'bg-[#fff2d6] text-[#8a5a00]',
  danger: 'bg-[#f8dddd] text-[#8f1d1d]'
}[props.variant]))
</script>

<template>
  <span :class="cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variantClass, props.class)">
    <slot />
  </span>
</template>
