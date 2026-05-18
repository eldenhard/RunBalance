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
  default: 'bg-slate-950 text-white shadow-sm active:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-950 active:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-950 active:bg-slate-50',
  ghost: 'text-slate-700 active:bg-slate-100',
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
    :class="cn('inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50', variantClass, sizeClass, props.class)"
  >
    <slot />
  </button>
</template>

