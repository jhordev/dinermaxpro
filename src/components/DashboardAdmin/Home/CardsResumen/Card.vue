<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { TrendingUp, TrendingDown } from "lucide-vue-next";
import { computed } from "vue";

// Props para personalizar el componente
const props = defineProps({
  title: {
    type: String,
    default: "Título",
  },
  value: {
    type: [String, Number],
    default: "0",
  },
  percentage: {
    type: Number,
    default: 0,
  },
  icon: {
    type: String,
    default: "@/assets/img/icons/admin/resumen/users.svg",
  },
});

// Cálculo para determinar el estado y el color
const isTrendingUp = computed(() => props.percentage >= 0);
const trendIcon = computed(() => (isTrendingUp.value ? TrendingUp : TrendingDown));
const trendColor = computed(() => (isTrendingUp.value ? "text-green-500" : "text-red-500"));
</script>

<template>
  <CardLayout class="text-colorTextBlack dark:text-white relative">
   <div class="flex gap-2 items-center">
     <img :src="icon" alt="icon users" class=" w-6 relative lg:absolute lg:w-auto lg:top-4 lg:right-4" />
     <span class="font-medium text-[12px] lg:text-[16px]">{{ title }}</span>
   </div>
    <h3 class="font-bold text-[20px] lg:text-[26px] mt-3 lg:mt-3 tracking-[1px]">{{ value }}</h3>
    <p class="font-normal text-[10px] lg:text-[12px] mt-3 lg:mt-8 inline-flex items-center gap-2">
      <component :is="trendIcon" :class="trendColor" />
      <span :class="trendColor">{{ Math.abs(percentage) }}% </span>
      <span v-if="isTrendingUp">Más que el mes pasado</span>
      <span v-else>Menos que el mes pasado</span>
    </p>

  </CardLayout>
</template>

<style scoped>
</style>
