<script setup>
import { ref } from 'vue';
import { EyeOff, Eye } from 'lucide-vue-next';

// Props: valores dinámicos
defineProps({
  totalAmount: {
    type: String,
    required: true,
  },
  totalInUSD: {
    type: String,
    required: true,
  },
});

// Estado para controlar la visibilidad de los valores
const isHidden = ref(false);

// Función para generar asteriscos dinámicos con el mismo número de caracteres
const generateMask = (value) => value.replace(/./g, '*');

// Función para alternar entre mostrar y ocultar
const toggleVisibility = () => {
  isHidden.value = !isHidden.value;
};
</script>

<template>
  <section class="flex gap-5 items-center">
    <!-- Contenedor del contenido -->
    <div class="flex flex-col gap-0.5">
      <h3 class="text-[16px] text-colorGraydark tracking-[1.6px] font-bold">Total</h3>

      <!-- Valores visibles u ocultos con asteriscos dinámicos -->
      <strong class="text-colorTextBlack dark:text-white text-[30px] tracking-[3px] font-bold">
        $ {{ isHidden ? generateMask(totalAmount) : totalAmount }}
      </strong>

      <span class="text-[16px] text-colorGraydark tracking-[1.6px] font-bold">
        ~ {{ isHidden ? generateMask(totalInUSD) : totalInUSD }}
      </span>
    </div>

    <!-- Ícono para alternar la visibilidad -->
    <button @click="toggleVisibility" aria-label="Toggle visibility">
      <EyeOff v-if="!isHidden" class="text-[24px] text-colorGraydark cursor-pointer" />
      <Eye v-else class="text-[24px] text-colorGraydark cursor-pointer" />
    </button>
  </section>
</template>

<style scoped>
button {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
