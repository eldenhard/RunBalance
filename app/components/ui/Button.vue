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
  default: 'bg-[var(--screen-foreground)] text-[var(--screen-bg)] active:opacity-90',
  secondary: 'bg-[var(--screen-surface-muted)] text-[var(--screen-foreground)] active:opacity-90',
  outline: 'border border-[var(--screen-border)] bg-transparent text-[var(--screen-foreground)] active:bg-[var(--screen-surface-muted)]',
  ghost: 'text-[var(--screen-foreground)] active:bg-[var(--screen-surface-muted)]',
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
