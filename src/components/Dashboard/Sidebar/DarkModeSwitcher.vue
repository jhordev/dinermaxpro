<script setup>
import { Moon, Sun } from 'lucide-vue-next'
import { useDarkModeStore } from '@/stores/darkMode.js'; // Importa el store de Pinia para manejar el dark mode

// Accede al store de modo oscuro
const darkModeStore = useDarkModeStore();

// Establecer las clases en el body al cambiar el tema
const applyDarkMode = () => {
  if (darkModeStore.darkMode) {
    document.documentElement.classList.add('dark'); // Agregar clase 'dark' al <html>
  } else {
    document.documentElement.classList.remove('dark'); // Eliminar clase 'dark' del <html>
  }
};

// Cambiar el estado y aplicar la clase
const toggleDarkMode = () => {
  darkModeStore.toggleDarkMode();
  applyDarkMode(); // Aplicar el cambio de clase cuando se cambia el estado
};

// Inicializar el modo oscuro correctamente al cargar la página
if (darkModeStore.darkMode) {
  applyDarkMode();
} else {
  document.documentElement.classList.remove('dark');
}
</script>

<template>
  <div class="inline-flex rounded-md shadow-sm mt-[60px]" role="group">
    <!-- Botón para Modo Claro -->
    <button
        type="button"
        class="flex gap-3 items-center px-4 py-2 text-[18px] font-medium text-colorTextBlack dark:text-white hover:bg-bgf3 dark:hover:bg-colorTextBlack"
        @click="darkModeStore.darkMode = false"
    >
      <Sun class="w-5 h-5" />
      Claro
    </button>

    <!-- Botón para Modo Oscuro -->
    <button
        type="button"
        class="flex gap-3 items-center px-4 py-2 text-[18px] font-medium text-colorTextBlack dark:text-white hover:bg-bgf3 dark:hover:bg-colorTextBlack"
        @click="darkModeStore.darkMode = true"
    >
      <Moon class="w-5 h-5" />
      Oscuro
    </button>
  </div>
</template>

<style scoped>
</style>
