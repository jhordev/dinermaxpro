<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { Equal, Plus, Loader2 } from 'lucide-vue-next';
import { walletService } from '@/services/wallet_service';
import { investmentService } from '@/services/investment_service';
import { auth } from '@/services/firebase_config';
import { logInfo, logError } from '@/utils/logger.js';
import imgVoucher from '@/assets/img/imgview.png';
import WalletIcon from '@/assets/icons/WalletIcon.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  selectedPlan: {
    type: Object,
    required: false,
    default: () => ({
      id: null,
      planName: '',
      interes: 0,
      capitalMinimo: 0,
      capitalMaximo: 0
    })
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const defaultImage = imgVoucher;
const imagePreview = ref(defaultImage);
const activeWallet = ref(null);
const isSubmitting = ref(false);
const investment = ref('');
const earnings = ref('0');
const voucherFile = ref(null);
const inputError = ref(false);
const errorMessage = ref('');
const interestRate = computed(() => props.selectedPlan?.interes || 0);

watch(investment, (newValue) => {
  if (newValue && !isNaN(newValue)) {
    const amount = Number(newValue);

    if (amount < props.selectedPlan.capitalMinimo) {
      inputError.value = true;
      errorMessage.value = `Mínimo $${props.selectedPlan.capitalMinimo.toLocaleString()}`;
      earnings.value = '0';
    } else if (amount > props.selectedPlan.capitalMaximo) {
      inputError.value = true;
      errorMessage.value = `Máximo $${props.selectedPlan.capitalMaximo.toLocaleString()}`;
      earnings.value = '0';
    } else {
      inputError.value = false;
      errorMessage.value = '';
      // Cálculo considerando 22 días hábiles por mes
      const diasHabilesPorMes = 22;
      const meses = Number(props.selectedPlan.tiempoMes);
      const diasTotales = diasHabilesPorMes * meses;
      const gananciasDiarias = amount * (interestRate.value / 100);
      earnings.value = (gananciasDiarias * diasTotales).toFixed(2);
    }
  } else {
    earnings.value = '0';
    inputError.value = false;
    errorMessage.value = '';
  }
});

const fetchActiveWallet = () => {
  const unsubscribe = walletService.subscribeToWallets((wallets) => {
    try {
      activeWallet.value = wallets[0] || null;
      logInfo('Wallet cargada correctamente');
    } catch (error) {
      logError('Error al procesar wallet:', error);
      activeWallet.value = null;
    }
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
};

const validateInput = (event) => {
  let value = Number(event.target.value);
  if (value > props.selectedPlan.capitalMaximo) {
    investment.value = props.selectedPlan.capitalMaximo;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5242880) {
      logError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }
    voucherFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    logInfo('Dirección copiada al portapapeles');
  } catch (error) {
    logError('Error al copiar al portapapeles:', error);
  }
};

const handleSubmit = async () => {
  const amount = Number(investment.value);

  if (amount < props.selectedPlan.capitalMinimo || amount > props.selectedPlan.capitalMaximo) {
    logError('El monto debe estar dentro del rango permitido');
    return;
  }

  if (!voucherFile.value) {
    logError('Debes subir un comprobante de pago');
    return;
  }

  if (!activeWallet.value) {
    logError('No hay una billetera activa seleccionada');
    return;
  }

  if (!auth.currentUser) {
    logError('No hay usuario autenticado');
    return;
  }

  isSubmitting.value = true;
  try {
    const investmentData = {
      userId: auth.currentUser.uid,
      planId: props.selectedPlan.id,
      planName: props.selectedPlan.planName,
      porcentajeMinRetiro: props.selectedPlan.porcentajeMinRetiro,
      investment: amount,
      interestRate: interestRate.value,
      duration: Number(props.selectedPlan.tiempoMes),
      paymentMethod: activeWallet.value.paymentMethod,
      walletAddress: activeWallet.value.walletAddress,
      network: activeWallet.value.network
    };

    await investmentService.createInvestment(investmentData, voucherFile.value);
    logInfo('Inversión registrada exitosamente');
    emit('submit'); // Modificar para no enviar datos
    closeModal();
  } catch (error) {
    logError('Error al procesar la inversión:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  imagePreview.value = defaultImage;
  investment.value = '';
  earnings.value = '0';
  voucherFile.value = null;
  inputError.value = false;
  errorMessage.value = '';
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    closeModal();
  }
});

onMounted(() => {
  fetchActiveWallet();
});
</script>

<template>
  <div v-if="modelValue && selectedPlan" id="crud-modal" tabindex="-1" aria-hidden="true"
       class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
    <div class="relative p-4 w-full max-w-full md:max-w-fit">
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal">
        <div class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Elegiste el plan {{ selectedPlan.planName }}
          </h3>
          <button type="button" @click="closeModal"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>

        <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
          <div class="flex flex-row items-center gap-5 md:gap-8 flex-wrap">
            <div class="flex-1 md:flex-auto">
              <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tu
                inversión</label>
              <input
                  v-model="investment"
                  type="number"
                  name="price"
                  id="price"
                  :max="selectedPlan.capitalMaximo"
                  :min="selectedPlan.capitalMinimo"
                  step="any"
                  @input="validateInput"
                  :placeholder="`Mínimo $${selectedPlan.capitalMinimo.toLocaleString()}`"
                  :class="{
      'bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:text-white': true,
      'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500': inputError,
      'border-gray-300 focus:ring-primary-600 focus:border-primary-600 dark:border-gray-500': !inputError
    }"
                  required
              >
              <p v-if="errorMessage" class="mt-1 text-sm text-red-600">
                {{ errorMessage }}
              </p>
            </div>
            <div class="flex-0.5 md:flex-0.5">
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">I %</label>
              <div
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                {{ interestRate }} %
              </div>
            </div>
            <Equal class="text-colorTextBlack dark:text-white"/>
            <div class="flex-1 md:flex-auto">
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ganancias</label>
              <div
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                $ {{ earnings }}
              </div>
            </div>
          </div>

          <div v-if="activeWallet" class="mt-6">
            <div class="rounded-[15px] bg-colorInputClaro p-2.5 shadow-default dark:bg-bgDashboardDark w-full">
              <div class="flex relative flex-row-reverse gap-2 md:gap-2.5 items-center pt-5 md:pt-0">
                <div class="flex flex-col gap-1.5 md:gap-2.5 w-full">
                  <h2 class="text-colorTextBlack dark:text-white font-bold text-[14px]">Forma de pago</h2>
                  <div class="text-colorTextBlack dark:text-white flex items-end gap-1 md:gap-3">
                    <span class="font-black uppercase text-[25px] md:text-[36px]">{{
                        activeWallet.paymentMethod
                      }}</span>
                    <p class="font-bold text-[12px] md:text-[14px]">Red: {{ activeWallet.network }}</p>
                  </div>
                  <div
                      class="flex justify-between items-center gap-2.5 bg-white dark:bg-colorTextBlack p-2 rounded-[10px] relative">
                    <span class="text-[12px] md:text-[14px] truncate text-colorTextBlack dark:text-white">
                      {{ activeWallet.walletAddress }}
                    </span>
                    <button type="button"
                            class="border border-colorTextBlack dark:border-gray-50 px-2 py-2 rounded-[5px] text-[10px] text-colorTextBlack dark:text-white"
                            @click="copyToClipboard(activeWallet.walletAddress)">
                      Copiar
                    </button>
                  </div>
                </div>
                <div class="w-[80px] md:w-auto absolute top-0 right-0 md:relative">
                  <img v-if="activeWallet.qrImage" :src="activeWallet.qrImage" alt="QR Code"
                       class="max-w-[140px] max-h-[140px] object-contain"/>
                  <WalletIcon v-else class="w-20 h-20 text-gray-400"/>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 flex items-center gap-5">
            <div>
              <img :src="imagePreview" alt="visualización de voucher" class="w-[100px] h-[100px] object-contain">
            </div>
            <div>
              <label class="mb-3 block text-sm font-medium text-colorTextBlack dark:text-white">
                Cargar Voucher
              </label>
              <input type="file" accept="image/*" @change="handleImageUpload"
                     class="w-full rounded-md border border-stroke p-3 outline-none transition file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:py-1 file:px-2.5 file:text-sm file:font-normal focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30 text-colorTextBlack dark:text-white dark:file:text-white"/>
            </div>
          </div>

          <div class="flex justify-center">
            <button type="submit"
                    :disabled="isSubmitting || inputError"
                    class="mt-10 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-700 dark:focus:ring-purple-800">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 me-2 animate-spin"/>
              <Plus v-else class="w-4 h-4 me-2"/>
              {{ isSubmitting ? 'Procesando...' : 'Confirmar Inversión' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>