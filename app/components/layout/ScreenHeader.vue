<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="space-y-1 pt-3">
    <p class="text-xs font-medium text-[var(--screen-muted)]">{{ eyebrow }}</p>
    <h1 class="text-[26px] font-medium leading-tight tracking-normal text-[var(--screen-foreground)]">{{ title }}</h1>
    <p v-if="description" class="max-w-[32rem] text-sm leading-5 text-[var(--screen-muted)]">
      {{ description }}
    </p>
  </header>
</template>
