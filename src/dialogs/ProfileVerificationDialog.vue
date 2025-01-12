<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { CircleCheck, CircleX, ChevronRight, AlertTriangle, X } from 'lucide-vue-next';
import { logInfo } from '@/utils/logger.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  userData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const router = useRouter();

const requiredFields = [
  {
    key: 'wallet',
    label: 'Dirección de Wallet',
    icon: props.userData?.wallet ? CircleCheck : CircleX,
    status: props.userData?.wallet ? 'completado' : 'pendiente',
    description: 'Necesaria para recibir tus ganancias'
  },
  {
    key: 'telefono',
    label: 'Número de Teléfono',
    icon: props.userData?.telefono ? CircleCheck : CircleX,
    status: props.userData?.telefono ? 'completado' : 'pendiente',
    description: 'Para mantener la seguridad de tu cuenta'
  },
  {
    key: 'pais',
    label: 'País',
    icon: props.userData?.pais ? CircleCheck : CircleX,
    status: props.userData?.pais ? 'completado' : 'pendiente',
    description: 'Requerido para cumplimiento legal'
  }
];

const closeDialog = () => {
  emit('update:modelValue', false);
};

const goToProfile = () => {
  logInfo('Redirigiendo al usuario al perfil para completar datos');
  closeDialog();
  router.push({ name: 'profileuser' });
};

const getCompletionPercentage = () => {
  const completed = requiredFields.filter(field => props.userData?.[field.key]).length;
  return Math.round((completed / requiredFields.length) * 100);
};
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-hidden">
    <div class="min-h-screen px-4 text-center">
      <div class="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/90 backdrop-blur-md"
           @click="closeDialog"></div>

      <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

      <div class="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-2xl scale-100 relative">
        <button @click="closeDialog"
                class="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
          <X class="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" />
        </button>

        <div class="mt-2">
          <div class="flex flex-col items-center mb-8">
            <div class="relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 animate-pulse"></div>
              <div class="relative bg-white dark:bg-gray-800 rounded-full p-3">
                <AlertTriangle class="w-12 h-12 text-yellow-500" />
              </div>
            </div>
            <h3 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white text-center">
              ¡Perfil Incompleto!
            </h3>
          </div>

          <div class="space-y-3">
            <div v-for="field in requiredFields"
                 :key="field.key"
                 class="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
                 :class="[
                   field.status === 'completado'
                     ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                     : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                 ]">
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <component :is="field.icon"
                               :class="field.status === 'completado'
                               ? 'text-white'
                               : 'text-gray-400 dark:text-gray-500'"
                               class="w-5 h-5" />
                    <div>
                      <h4 class="font-medium" :class="field.status === 'completado' ? 'text-white' : 'dark:text-white'">
                        {{ field.label }}
                      </h4>
                      <p class="text-xs" :class="field.status === 'completado' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'">
                        {{ field.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="button"
                  class="mt-8 w-full inline-flex justify-center items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  @click="goToProfile">
            Completar mi Perfil
            <ChevronRight class="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scale-100 {
  animation: dialogAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dialogAppear {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>