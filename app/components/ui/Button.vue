<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  class?: string
}>(), {
  variant: 'default',
  size: 'md'
})

const variantClass = computed(() => ({
  default: 'bg-[#111111] text-white active:bg-[#2a2a2a] dark:bg-white dark:text-[#0b0b0c]',
  secondary: 'bg-[#f0f0ed] text-[#111111] active:bg-[#e7e7e2] dark:bg-[#151515] dark:text-white',
  outline: 'border border-[#deded9] bg-white text-[#111111] active:bg-[#f7f7f5] dark:border-[#303030] dark:bg-transparent dark:text-white',
  ghost: 'text-[#444] active:bg-[#f0f0ed] dark:text-[#d8d8d8] dark:active:bg-[#151515]',
  destructive: 'bg-red-600 text-white active:bg-red-700'
}[props.variant]))

const sizeClass = computed(() => ({
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-11 w-11'
}[props.size]))
</script>

<template>
  <button
    :class="cn('inline-flex items-center justify-center gap-2 rounded-[14px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50', variantClass, sizeClass, props.class)"
  >
    <slot />
  </button>
</template>
