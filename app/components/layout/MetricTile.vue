<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  detail?: string
  dark?: boolean
}>(), {
  dark: false
})
</script>

<template>
  <div
    :class="[
      'rounded-2xl border p-3',
      dark ? 'border-[#252525] bg-[#151515]' : 'border-[#deded9] bg-white'
    ]"
  >
    <p :class="['text-[11px]', dark ? 'text-[#8f8f8f]' : 'text-[#767676]']">{{ label }}</p>
    <p :class="['mt-1 text-[22px] font-medium leading-none tracking-normal', dark ? 'text-white' : 'text-[#111111]']">{{ value }}</p>
    <p v-if="detail" :class="['mt-1 text-xs', dark ? 'text-[#8f8f8f]' : 'text-[#767676]']">{{ detail }}</p>
  </div>
</template>
