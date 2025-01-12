<script setup>
import { ref, watch } from 'vue';
import { Plus, Loader2 } from "lucide-vue-next";
import { logInfo, logError } from '@/utils/logger.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'add-wallet', 'update-wallet']);

const walletData = ref({
  paymentMethod: "",
  network: "",
  walletAddress: "",
  voucherImage: null,
});

const imagePreview = ref(null);
const fileInputRef = ref(null);
const isSubmitting = ref(false);

// Definir resetForm antes de usarlo en los watches
const resetForm = () => {
  walletData.value = {
    paymentMethod: "",
    network: "",
    walletAddress: "",
    voucherImage: null,
  };
  imagePreview.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const closeModal = () => {
  resetForm();
  emit('update:modelValue', false);
};

const handleImageUpload = (event) => {
  try {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB limit
        throw new Error('La imagen no debe exceder 5MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      walletData.value.voucherImage = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
      logInfo('Imagen cargada correctamente');
    }
  } catch (error) {
    logError('Error al cargar imagen:', error);
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    walletData.value.voucherImage = null;
    imagePreview.value = null;
  }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    const formData = new FormData();
    formData.append('paymentMethod', walletData.value.paymentMethod.toLowerCase());
    formData.append('network', walletData.value.network);
    formData.append('walletAddress', walletData.value.walletAddress);

    if (walletData.value.voucherImage) {
      formData.append('voucherImage', walletData.value.voucherImage);
    }

    if (props.isEditMode) {
      await emit('update-wallet', formData);
      logInfo('Wallet actualizada correctamente');
    } else {
      await emit('add-wallet', formData);
      logInfo('Wallet agregada correctamente');
    }
    closeModal();
  } catch (error) {
    logError('Error al procesar el formulario:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Watches después de definir todas las funciones
watch(
    () => props.editData,
    (newData) => {
      if (props.isEditMode && newData) {
        walletData.value = {
          paymentMethod: newData.paymentMethod || "",
          network: newData.network || "",
          walletAddress: newData.walletAddress || "",
          voucherImage: null
        };
        imagePreview.value = newData.qrImage || null;
      } else {
        resetForm();
      }
    },
    { immediate: true }
);

watch(
    () => props.modelValue,
    (newValue) => {
      if (!newValue) {
        closeModal();
      }
    }
);
</script>

<template>
  <div
      v-if="modelValue"
      id="add-wallet-modal"
      tabindex="-1"
      aria-hidden="true"
      class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
    <div class="relative p-4 w-full max-w-full md:max-w-md">
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal">
        <div class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Editar Billetera' : 'Agregar Billetera' }}
          </h3>
          <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal"
              :disabled="isLoading || isSubmitting">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>

        <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-3 gap-6">
            <div class="col-span-1 flex flex-col gap-2.5">
              <label for="paymentMethod" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">
                Método
              </label>
              <input
                  v-model="walletData.paymentMethod"
                  type="text"
                  id="paymentMethod"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  placeholder="BV"
                  required
                  :disabled="isLoading || isSubmitting">
            </div>
            <div class="col-span-2 flex flex-col gap-2.5">
              <label for="network" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">
                Red
              </label>
              <input
                  v-model="walletData.network"
                  type="text"
                  id="network"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  placeholder="Wallet-Tron (TRC20)"
                  required
                  :disabled="isLoading || isSubmitting">
            </div>
            <div class="col-span-3 flex flex-col gap-2.5">
              <label for="walletAddress" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">
                Dirección de Billetera
              </label>
              <input
                  v-model="walletData.walletAddress"
                  type="text"
                  id="walletAddress"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  placeholder="Ingrese la dirección de billetera"
                  required
                  :disabled="isLoading || isSubmitting">
            </div>
            <div class="col-span-3 mt-5 flex items-center gap-5">
              <div class="w-[100px] h-[100px] border rounded-lg overflow-hidden flex items-center justify-center">
                <img v-if="imagePreview" :src="imagePreview" alt="QR Preview"
                     class="w-full h-full object-cover">
                <span v-else class="text-gray-400 text-sm text-center">
                  Sin imagen
                </span>
              </div>
              <div class="flex-1">
                <label class="mb-3 block text-sm font-medium text-colorTextBlack dark:text-white">
                  Cargar QR
                </label>
                <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="w-full rounded-md border border-stroke p-3 outline-none transition file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:py-1 file:px-2.5 file:text-sm file:font-normal focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30 text-colorTextBlack dark:text-white dark:file:text-white"
                    :disabled="isLoading || isSubmitting"
                />
              </div>
            </div>
          </div>

          <button
              type="submit"
              class="mt-4 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-700 dark:focus:ring-purple-800"
              :disabled="isLoading || isSubmitting">
            <Loader2 v-if="isLoading || isSubmitting" class="w-4 h-4 me-2 animate-spin"/>
            <Plus v-else class="w-4 h-4 me-2"/>
            {{ isEditMode ? 'Actualizar Billetera' : 'Agregar Billetera' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
