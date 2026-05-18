<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="space-y-1 pt-3">
    <p class="text-xs font-medium text-[#767676] dark:text-[#9b9b9b]">{{ eyebrow }}</p>
    <h1 class="text-[26px] font-medium leading-tight tracking-normal text-[#111111] dark:text-white">{{ title }}</h1>
    <p v-if="description" class="max-w-[32rem] text-sm leading-5 text-[#62625e] dark:text-[#b8b8b8]">
      {{ description }}
    </p>
  </header>
</template>

