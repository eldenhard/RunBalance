<script setup lang="ts">
import { cn } from '~/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <section :class="cn('rounded-lg border border-slate-200 bg-white shadow-sm', $props.class)">
    <slot />
  </section>
</template>

