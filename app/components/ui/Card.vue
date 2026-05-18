<script setup lang="ts">
import { cn } from '~/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <section :class="cn('rounded-[18px] border border-[#deded9] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.045)] dark:border-[#252525] dark:bg-[#151515] dark:shadow-none', $props.class)">
    <slot />
  </section>
</template>
