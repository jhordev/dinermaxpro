<!-- ForgotPasswordDialog.vue -->
<script setup>
import { ref } from 'vue';

// Definición de eventos emitidos por el componente
const emit = defineEmits(['close']);

const email = ref('');
const isSubmitting = ref(false);

// Función para manejar la recuperación de contraseña
const handleForgotPassword = () => {
  if (!email.value) {
    alert('Por favor, ingrese su correo electrónico');
    return;
  }

  isSubmitting.value = true;

  // Simulación de llamada API
  setTimeout(() => {
    alert(`Correo de recuperación enviado a ${email.value}`);
    email.value = '';
    isSubmitting.value = false;
    emit('close'); // Cierra el modal después de enviar
  }, 1500);
};

// Función para cerrar el modal manualmente
const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6 dark:text-white">Recuperar Contraseña</h2>
      <p class="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
        Ingresa tu correo electrónico para enviar un enlace de recuperación.
      </p>
      <form @submit.prevent="handleForgotPassword">
        <div class="mb-4">
          <label for="email" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
          <input
              v-model="email"
              id="email"
              type="email"
              placeholder="Ingrese su correo"
              class="w-full pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
              required
          />
        </div>
        <div class="flex justify-end mt-4">
          <button
              type="button"
              @click="closeModal"
              class="py-2 px-4 mr-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-400">
            Cancelar
          </button>
          <button
              type="submit"
              :disabled="isSubmitting"
              class="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
            <span v-if="!isSubmitting">Recuperar</span>
            <span v-else>Enviando...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales para el modal si es necesario */
</style>
