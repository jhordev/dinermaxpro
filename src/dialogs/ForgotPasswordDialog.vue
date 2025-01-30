<script setup>
import { ref } from 'vue';
import { Mail, Loader2, ShieldCheck } from 'lucide-vue-next';
import { logInfo, logError } from '@/utils/logger.js';
import { userService } from '@/services/user_service.js';

const emit = defineEmits(['close']);

const email = ref('');
const isSubmitting = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = 'Por favor, ingresa tu correo electrónico';
    showError.value = true;
    logError('Email vacío en intento de recuperación de contraseña');
    return;
  }

  isSubmitting.value = true;
  showError.value = false;

  try {
    const result = await userService.sendPasswordResetEmail(email.value);

    if (result.success) {
      logInfo(`Solicitud de recuperación enviada a: ${email.value}`);
      email.value = '';
      emit('close');
    } else {
      errorMessage.value = result.error;
      showError.value = true;
    }
  } catch (error) {
    errorMessage.value = 'Error al procesar la solicitud';
    showError.value = true;
    logError(`Error en recuperación de contraseña: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div class="w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
      <!-- Header con gradiente -->
      <div class="relative bg-gradient-to-r from-blue-600 to-indigo-600 pb-20 pt-6">
        <div class="absolute left-1/2 -translate-x-1/2 -bottom-12">
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 p-4 shadow-xl">
            <Mail class="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <div class="px-6">
          <h3 class="text-2xl font-bold text-white/90 text-center">
            Recuperar Contraseña
          </h3>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <div class="px-8 pt-16 pb-10 space-y-8">
        <p class="text-center text-gray-400 px-6">
          Ingresa tu correo electrónico para enviar un enlace de recuperación
        </p>

        <!-- Mensaje de error -->
        <div v-if="showError" class="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p class="text-red-400 text-sm text-center">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-8">
          <div class="relative">
            <input
                v-model="email"
                type="email"
                placeholder="Correo electrónico"
                class="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-5 py-4 text-white placeholder-gray-400 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button
                type="button"
                @click="$emit('close')"
                class="w-full rounded-xl border-2 border-gray-700 bg-gray-800 px-6 py-4 text-sm font-medium text-gray-300 transition-all hover:bg-gray-700"
            >
              Cancelar
            </button>

            <button
                type="submit"
                :disabled="isSubmitting"
                class="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              <span class="flex items-center justify-center gap-2" :class="{ 'opacity-0': isSubmitting }">
                <ShieldCheck class="h-5 w-5" />
                Recuperar
              </span>
              <div v-if="isSubmitting" class="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
                <Loader2 class="h-5 w-5 animate-spin" />
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>