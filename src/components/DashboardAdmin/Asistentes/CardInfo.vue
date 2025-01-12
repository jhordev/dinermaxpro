<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Título",
  },
  value: {
    type: [String, Number],
    default: "0",
  },
});

const isTrendingUp = computed(() => props.percentage >= 0);

// Nueva computed property para formatear el valor
const formattedValue = computed(() => {
  // Si el título incluye "Fondos", aplicamos formato de moneda
  if (props.title.includes('Fondos') || props.title.includes('fondos')) {
    const number = typeof props.value === 'string' ? parseFloat(props.value.replace(/,/g, '')) : props.value;
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  }
  // Si no es un valor monetario, retornamos el valor original
  return props.value;
});
</script>

<template>
  <CardLayout class="text-colorTextBlack dark:text-white relative">
    <div class="flex gap-2 items-center">
      <span class="font-medium text-[12px] lg:text-[16px]">{{ title }}</span>
    </div>
    <h3 class="font-bold text-[20px] lg:text-[26px] mt-3 lg:mt-3 tracking-[1px]">{{ formattedValue }}</h3>
  </CardLayout>
</template>

<style scoped>
</style>