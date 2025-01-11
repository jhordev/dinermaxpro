<script setup>
import { ref, defineEmits } from 'vue';

// Definimos los eventos que este componente puede emitir
const emit = defineEmits(['switchToggled']);

// Estado del switch
const isChecked = ref(false);

// Función para manejar el cambio del switch
const toggleSwitch = () => {
  isChecked.value = !isChecked.value;
  emit('switchToggled', isChecked.value);
};
</script>

<template>
  <section>
    <div class="flex justify-between w-full">
      <!-- Título dinámico basado en el estado del switch -->
      <h1 class="text-colorTextBlack dark:text-white text-[18px] md:text-[22px] font-bold">
        {{ isChecked ? 'Información General' : 'Información Específicos' }}
      </h1>

      <!-- Switch reutilizable -->
      <label class="inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            class="sr-only peer"
            :checked="isChecked"
            @change="toggleSwitch">
        <div
            class="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
        </div>
      </label>
    </div>
  </section>
</template>

<style scoped>
</style>
