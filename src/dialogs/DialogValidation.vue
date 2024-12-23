<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Loader2, RefreshCw } from 'lucide-vue-next';
import { authService } from '@/services/auth_service';
import { logError, logInfo } from '@/utils/logger.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  email: {
    type: String,
    required: true
  },
  isLogin: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'validated']);

const code = ref('');
const loading = ref(false);
const resendLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const canResend = ref(false);
const resendTimer = ref(180);
const resendInterval = ref(null);

onMounted(() => {
  startResendTimer();
});

const startResendTimer = () => {
  canResend.value = false;
  resendTimer.value = 180;

  resendInterval.value = setInterval(() => {
    resendTimer.value--;
    if (resendTimer.value <= 0) {
      clearInterval(resendInterval.value);
      canResend.value = true;
      resendTimer.value = 180;
    }
  }, 1000);
};

const handleValidate = async () => {
  if (code.value.length !== 6) {
    errorMessage.value = 'El código debe tener 6 dígitos';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const verificationResult = await authService.verifyCode(props.email, code.value);
    if (!verificationResult.success) {
      throw new Error(verificationResult.error);
    }

    if (!props.isLogin) {
      const registrationResult = await authService.completeRegistration();
      if (!registrationResult.success) {
        throw new Error(registrationResult.error);
      }
    }

    successMessage.value = 'Validación exitosa';
    logInfo('Sesión validada correctamente');

    // Usar el rol devuelto por verifyCode
    const userRole = verificationResult.role;

    setTimeout(() => {
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }, 1000);

  } catch (error) {
    logError(`Error en validación: ${error.message}`);
    errorMessage.value = error.message || 'Error al validar el código';
    if (props.isLogin) {
      await authService.logout();
    }
  } finally {
    loading.value = false;
  }
};

const handleResendCode = async () => {
  if (!canResend.value) return;

  resendLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const result = await authService.sendVerificationCode(props.email);
    if (result.success) {
      successMessage.value = 'Nuevo código enviado';
      logInfo(`Código reenviado a: ${props.email}`);
      startResendTimer();
    } else {
      errorMessage.value = result.error;
    }
  } catch (error) {
    logError(`Error al reenviar código: ${error.message}`);
    errorMessage.value = 'Error al reenviar el código';
  } finally {
    resendLoading.value = false;
  }
};

onUnmounted(() => {
  if (resendInterval.value) {
    clearInterval(resendInterval.value);
  }
});
</script>

<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
    <div
        class="bg-white dark:bg-gray-800 rounded-[24px] p-8 w-[90%] max-w-md m-4 shadow-xl transform transition-all duration-300 ease-in-out"
    >
      <div class="flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-colorCeleste/10 rounded-full flex items-center justify-center mb-4">
          <RefreshCw class="w-8 h-8 text-colorCeleste" />
        </div>

        <h2 class="text-2xl font-bold mb-2 text-colorTextBlack dark:text-white">
          Verificación de Cuenta
        </h2>

        <p class="text-gray-600 dark:text-gray-300 mb-8">
          Hemos enviado un código de verificación a<br>
          <span class="font-semibold text-colorTextBlack dark:text-white">{{ email }}</span>
        </p>

        <div class="w-full space-y-6">
          <div class="relative">
            <input
                type="text"
                v-model="code"
                maxlength="6"
                placeholder="000000"
                class="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-[16px] focus:ring-2 focus:ring-colorCeleste focus:border-transparent bg-transparent text-colorTextBlack dark:text-white text-center text-2xl tracking-[1em] font-medium transition-all duration-200 ease-in-out placeholder:text-gray-400 placeholder:tracking-normal"
            />

            <button
                @click="handleResendCode"
                :disabled="resendLoading || !canResend"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-colorCeleste hover:text-opacity-80 transition-all duration-200 ease-in-out p-2 hover:bg-colorCeleste/10 rounded-full"
                title="Reenviar código"
            >
              <RefreshCw
                  :class="{'animate-spin': resendLoading}"
                  class="w-5 h-5"
              />
            </button>
          </div>

          <div class="min-h-[24px]">
            <p v-if="errorMessage" class="text-red-500 text-sm animate-fade-in">
              {{ errorMessage }}
            </p>
            <p v-if="successMessage" class="text-green-500 text-sm animate-fade-in">
              {{ successMessage }}
            </p>
          </div>

          <div class="flex gap-4">
            <button
                @click="handleValidate"
                :disabled="loading"
                class="flex-1 bg-colorCeleste text-white py-4 px-6 rounded-[16px] hover:bg-opacity-90 flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Loader2 v-if="loading" class="animate-spin mr-2 h-5 w-5" />
              <span>{{ loading ? 'Verificando...' : 'Verificar' }}</span>
            </button>

            <button
                @click="$emit('close')"
                :disabled="loading"
                class="flex-1 border-2 border-colorCeleste text-colorCeleste dark:text-white py-4 px-6 rounded-[16px] font-bold hover:bg-colorCeleste/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            ¿No recibiste el código?
            <button
                @click="handleResendCode"
                :disabled="resendLoading || !canResend"
                class="text-colorCeleste hover:underline disabled:opacity-50 disabled:cursor-not-allowed ml-1 font-medium"
            >
              {{ !canResend ? `Reenviar código (${resendTimer}s)` : 'Reenviar código' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>