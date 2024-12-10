import { ref, onMounted } from 'vue';
import { defineStore } from 'pinia';

export const useDarkModeStore = defineStore('darkMode', () => {
  const darkMode = ref(false); // Estado inicial del modo oscuro

  // Inicializar el modo oscuro al cargar la aplicación
  function initializeDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      // Si hay un modo guardado, úsalo
      darkMode.value = savedMode === 'true';
    } else {
      // Si no hay preferencia guardada, usar la preferencia del sistema
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      darkMode.value = prefersDarkMode;
    }

    // Aplicar la clase al <html>
    applyDarkMode();
  }

  // Alternar el modo oscuro manualmente
  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    localStorage.setItem('darkMode', darkMode.value); // Guardar el estado en Local Storage
    applyDarkMode();
  }

  // Aplicar la clase `dark` al <html>
  function applyDarkMode() {
    if (darkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Ejecutar la inicialización al montar el store
  onMounted(() => {
    initializeDarkMode();
  });

  return { darkMode, toggleDarkMode, initializeDarkMode };
});
