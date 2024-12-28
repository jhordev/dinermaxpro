import { ref, onMounted } from 'vue';
import { defineStore } from 'pinia';

export const useDarkModeStore = defineStore('darkMode', () => {
  const darkMode = ref(false); // Estado inicial del modo claro

  // Inicializar el modo oscuro al cargar la aplicación
  const initializeDarkMode = () => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      // Si hay un modo guardado, úsalo
      darkMode.value = savedMode === 'true';
    } else {
      // Si no hay preferencia guardada, por defecto usar modo claro
      darkMode.value = false;
    }

    // Aplicar la clase al <html>
    applyDarkMode();
  };

  // Alternar el modo oscuro manualmente
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
    localStorage.setItem('darkMode', darkMode.value.toString()); // Guardar el estado en Local Storage
    applyDarkMode();
  };

  // Aplicar la clase `dark` al <html>
  const applyDarkMode = () => {
    if (darkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Ejecutar la inicialización al montar el store
  onMounted(() => {
    initializeDarkMode();
  });

  // Retornar el estado y las funciones
  return { darkMode, toggleDarkMode };
});
