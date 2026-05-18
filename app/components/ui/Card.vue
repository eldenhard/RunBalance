<script setup lang="ts">
import { cn } from '~/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <section :class="cn('rounded-[18px] border border-[var(--screen-border)] bg-[var(--screen-surface)] text-[var(--screen-foreground)] shadow-[var(--screen-shadow)]', $props.class)">
    <slot />
  </section>
</template>
