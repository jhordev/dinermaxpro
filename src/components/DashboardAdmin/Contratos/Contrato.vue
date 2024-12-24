<script setup>
import {ref, watch} from 'vue';
import imgVoucher from '@/assets/img/imgview.png';
import {X, XCircle} from 'lucide-vue-next';
import { investmentService } from '@/services/investment_service';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: ''
  },
  monto: {
    type: Number,
    required: true,
    default: ''
  },
  walletAddress: {
    type: String,
    required: true,
    default: ''
  },
  image: {
    type: String,
    required: true,
    default: ''
  },
  investmentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending'
  }
});

const defaultImage = imgVoucher;
const emit = defineEmits(['update:modelValue']);
const imagePreview = ref(defaultImage);
const showImagePopup = ref(false);
const isApproved = ref(props.status === 'approved');
const isImageLoading = ref(true);

const closeModal = () => {
  imagePreview.value = defaultImage;
  emit('update:modelValue', false);
};

const closeImagePopup = () => {
  showImagePopup.value = false;
};

const handleImageLoad = () => {
  isImageLoading.value = false;
};

const handleStatusChange = async (event) => {
  const newStatus = event.target.checked ? 'approved' : 'pending';
  try {
    await investmentService.updateInvestmentStatus(props.investmentId, newStatus);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    isApproved.value = !isApproved.value;
  }
};

const handleReject = async () => {
  try {
    await investmentService.updateInvestmentStatus(props.investmentId, 'rejected');
    closeModal();
  } catch (error) {
    console.error('Error al rechazar:', error);
  }
};

watch(
    () => props.modelValue,
    (newValue) => {
      if (!newValue) {
        closeModal();
      }
    }
);

watch(() => props.status, (newStatus) => {
  isApproved.value = newStatus === 'approved';
});

</script>

<template>
  <div
      v-if="modelValue"
      id="crud-modal"
      tabindex="-1"
      aria-hidden="true"
      class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
    <div class="relative p-4 w-full max-w-full md:max-w-fit">
      <div class="w-full md:w-[450px] relative bg-white rounded-[20px] shadow dark:bg-bgModal">
        <div class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Activar membresía
          </h3>
          <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <section class="p-5">
          <div class="flex justify-between items-center">
            <div class="flex flex-col md:flex-row items-center gap-2">
              <div class="flex flex-col">
                <h3 class="text-colorTextBlack dark:text-white text-[14px] md:text-[16px] font-semibold uppercase text-center">
                  {{ name }}
                </h3>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    :checked="isApproved"
                    @change="handleStatusChange"
                    :disabled="props.status === 'rejected'"
                    class="sr-only peer"
                >
                <div class="relative w-14 h-7 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-colorBgButton"></div>
              </label>
              <button
                  @click="handleReject"
                  class="text-red-500 hover:text-red-700"
                  title="Rechazar">
                <XCircle size="24" />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2.5 items-center mt-5">
            <h3 class="text-[16px] font-bold text-colorTextBlack dark:text-white">Monto: {{ monto }}</h3>
            <div class="w-[275px] h-[349px] flex justify-center items-center" @click="showImagePopup = true">
              <!-- Loader circular -->
              <div v-if="isImageLoading" class="absolute">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <img
                  :src="image"
                  class="rounded-[10px] border-4 h-full object-contain"
                  @load="handleImageLoad"
                  :class="{ 'opacity-0': isImageLoading }"
              >
            </div>
            <h3 class="text-[12px] text-center font-normal text-colorTextBlack dark:text-white">Transacción a: Wallet-Tron (TRC20)
              <br> {{ walletAddress }}</h3>
          </div>
        </section>
      </div>
    </div>
  </div>

  <div
      v-if="showImagePopup"
      class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-75">
    <div class="relative w-full h-full max-w-[90%] max-h-[90%] flex items-center justify-center">
      <button
          type="button"
          class="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
          @click="closeImagePopup">
        <X/>
      </button>
      <!-- Loader circular para imagen popup -->
      <div v-if="isImageLoading" class="absolute">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <img
          :src="image"
          class="rounded-[10px] w-auto h-auto max-w-full max-h-full object-contain"
          @load="handleImageLoad"
          :class="{ 'opacity-0': isImageLoading }"
      >
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
