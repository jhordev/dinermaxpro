<script setup>
import { XCircle, LogOut, ShieldAlert } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth_service';
import { logError } from '@/utils/logger';
import { ref } from 'vue';

const router = useRouter();
const isLoading = ref(false);

const handleLogout = async () => {
  try {
    isLoading.value = true;
    await authService.logout();
    router.push('/login');
  } catch (error) {
    logError(`Error al cerrar sesión: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
    <div
        class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl
             border border-red-100 dark:border-red-900 transform scale-100"
    >
      <!-- Contenedor principal -->
      <div class="flex flex-col items-center space-y-6">
        <!-- Ícono principal -->
        <div class="relative">
          <div class="w-24 h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
            <ShieldAlert class="w-12 h-12 text-red-500 dark:text-red-400 animate-pulse" />
          </div>
          <div class="absolute -top-2 -right-2">
            <div class="p-1 bg-red-100 dark:bg-red-900/50 rounded-full">
              <XCircle class="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
          </div>
        </div>

        <!-- Contenido de texto -->
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Cuenta Bloqueada
          </h2>

          <div class="space-y-2">
            <p class="text-gray-600 dark:text-gray-300">
              Tu cuenta ha sido deshabilitada por incumplimiento de las políticas.
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Si crees que esto es un error, por favor contacta al soporte para más información.
            </p>
          </div>
        </div>

        <!-- Botón de acción -->
        <button
            @click="handleLogout"
            :disabled="isLoading"
            class="w-full bg-red-500 hover:bg-red-600 active:bg-red-700
                 disabled:bg-red-400 text-white font-medium py-3 px-6
                 rounded-xl transition-all duration-200
                 transform hover:-translate-y-0.5 active:translate-y-0
                 disabled:cursor-not-allowed disabled:transform-none
                 flex items-center justify-center gap-3
                 shadow-lg shadow-red-500/20"
        >
          <template v-if="isLoading">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
              />
              <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cerrando sesión...</span>
          </template>
          <template v-else>
            <LogOut class="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fixed {
  animation: fadeIn 0.3s ease-out;
}

.transform {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>