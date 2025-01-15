<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { verificationService } from '@/services/withdrawal_verification_service';
import { logError, logInfo } from '@/utils/logger';
import { Send, RefreshCw, X, Mail, Loader2, ShieldCheck, Clock } from 'lucide-vue-next';

const emit = defineEmits(['close', 'verified']);

const verificationCode = ref('');
const isLoading = ref(false);
const isGenerating = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const countdown = ref(0);
const canResend = ref(true);
const showSuccessAnimation = ref(false);

const codeInputs = ref(['', '', '', '', '', '']);
const inputRefs = ref([]);

const focusNextInput = (index) => {
  if (index < 5 && codeInputs.value[index]) {
    inputRefs.value[index + 1].focus();
  }
};

const focusPrevInput = (index) => {
  if (index > 0) {
    inputRefs.value[index - 1].focus();
  }
};

const handleCodeInput = (index, event) => {
  const value = event.target.value;
  if (/^\d*$/.test(value)) {
    codeInputs.value[index] = value.slice(-1);
    verificationCode.value = codeInputs.value.join('');
    focusNextInput(index);
  }
};

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !codeInputs.value[index]) {
    focusPrevInput(index);
  }
};

const handlePaste = (event) => {
  const pastedCode = event.clipboardData.getData('text');
  if (/^\d{6}$/.test(pastedCode)) {
    codeInputs.value = pastedCode.split('');
    verificationCode.value = pastedCode;
    inputRefs.value[5].focus();
  }
};

const clearInputs = () => {
  codeInputs.value = ['', '', '', '', '', ''];
  verificationCode.value = '';
  inputRefs.value[0]?.focus();
};

const startCountdown = () => {
  canResend.value = false;
  countdown.value = 180;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      canResend.value = true;
    }
  }, 1000);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const generateCode = async () => {
  try {
    isGenerating.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    clearInputs();

    await verificationService.generateVerificationCode();
    successMessage.value = 'Código enviado a tu correo electrónico';
    startCountdown();
    logInfo('Código de verificación generado exitosamente');
  } catch (error) {
    errorMessage.value = error.message;
    logError('Error al generar código:', error);
  } finally {
    isGenerating.value = false;
  }
};

const validateCode = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    if (verificationCode.value.length !== 6) {
      throw new Error('Por favor ingresa el código completo de 6 dígitos');
    }

    await verificationService.verifyCode(verificationCode.value);
    showSuccessAnimation.value = true;
    successMessage.value = 'Código verificado correctamente';
    logInfo('Código validado exitosamente');
    emit('verified');
  } catch (error) {
    errorMessage.value = error.message;
    logError('Error al validar código:', error);
    isLoading.value = false;
  }
};

onMounted(() => {
  generateCode();
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div class="w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
      <div class="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-10">
        <div class="absolute left-1/2 -translate-x-1/2 top-16">
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 p-4 shadow-xl">
            <ShieldCheck class="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <div class="relative -top-5">
          <h3 class="text-2xl font-bold text-white text-center">
            Verificación de Seguridad
          </h3>
          <button
              @click="$emit('close')"
              class="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 transition-colors"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="mt-16 space-y-6 p-8">
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 text-gray-400">
            <Mail class="h-5 w-5" />
            <p>Te enviamos un código a tu correo</p>
          </div>
        </div>

        <div v-if="errorMessage" class="animate-shake">
          <div class="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-400">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <X class="h-5 w-5" />
            </div>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>

        <div v-if="successMessage" class="animate-fadeIn">
          <div class="flex items-center gap-3 rounded-xl bg-green-500/10 p-4 text-green-400">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
              <ShieldCheck class="h-5 w-5" />
            </div>
            <p class="text-sm">{{ successMessage }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-center gap-3">
            <template v-for="(digit, index) in codeInputs" :key="index">
              <input
                  type="text"
                  :ref="el => inputRefs[index] = el"
                  v-model="codeInputs[index]"
                  @input="handleCodeInput(index, $event)"
                  @keydown="handleKeydown(index, $event)"
                  @paste="handlePaste"
                  maxlength="1"
                  class="h-14 w-14 rounded-xl border-2 border-gray-700 bg-gray-800 text-center text-xl font-bold text-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  :disabled="isLoading"
              />
            </template>
          </div>
        </div>

        <div class="flex gap-3">
          <button
              @click="validateCode"
              :disabled="isLoading || verificationCode.length !== 6"
              class="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            <span class="flex items-center justify-center gap-2" :class="{ 'opacity-0': isLoading }">
              <Send class="h-5 w-5" />
              Verificar
            </span>
            <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
              <Loader2 class="h-5 w-5 animate-spin" />
            </div>
          </button>

          <button
              @click="generateCode"
              :disabled="!canResend || isGenerating"
              class="group relative rounded-xl border-2 border-gray-700 bg-gray-800 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-gray-700 disabled:opacity-50"
          >
            <span class="flex items-center justify-center gap-2" :class="{ 'opacity-0': isGenerating }">
              <template v-if="!canResend">
                <Clock class="h-5 w-5" />
                {{ formatTime(countdown) }}
              </template>
              <template v-else>
                <RefreshCw class="h-5 w-5" />
                Reenviar
              </template>
            </span>
            <div v-if="isGenerating" class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="h-5 w-5 animate-spin" />
            </div>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-500">
            ¿No recibiste el código?
            <a href="mailto:support@dinnersmax.com" class="text-blue-500 hover:text-blue-400">Contacta soporte</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
  40%, 60% { transform: translate3d(2px, 0, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>