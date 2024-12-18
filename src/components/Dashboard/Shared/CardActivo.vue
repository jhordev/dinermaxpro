<script setup>
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import { defineProps } from 'vue';

defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  percentage: {
    type: String,
    required: true,
  },
  isPositive: {
    type: Boolean,
    required: true,
  },
  textColor: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <article
      class="flex flex-col gap-2 md:gap-4 rounded-[8px] bg-bgCardLigth py-4 px-5 shadow-default dark:bg-bgDashboardDark"
  >
    <header class="flex items-center gap-2 md:gap-3">
      <img :src="imageSrc" alt="Crypto Image" class="w-5 md:w-auto" />
      <h3 class="text-[14px] md:text-[18px] font-semibold text-colorTextBlack dark:text-white">
        {{ name }}
      </h3>
    </header>
    <strong class="text-[14px] md:text-[18px] tracking-[1px] md:tracking-[1.8px] text-colorTextBlack dark:text-white">
      {{ amount }}
    </strong>
    <footer class="flex items-center gap-1.5" :class="textColor">
      <component
          :is="isPositive ? ChevronUp : ChevronDown"
          class="w-4 h-4"
      />
      <span class="font-semibold tracking-normal md:tracking-[1.4px] text-[12px] md:text-[14px]">
        {{ percentage }}
      </span>
    </footer>
  </article>
</template>

<style scoped>
</style>
