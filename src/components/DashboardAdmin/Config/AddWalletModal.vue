<script setup>
import {ref, watch} from 'vue';
import {Plus} from "lucide-vue-next";

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
  }
});

const emit = defineEmits(['update:modelValue', 'add-wallet', 'update-wallet']);

// Datos del formulario
const walletData = ref({
  paymentMethod: "",
  network: "",
  walletAddress: "",
  voucherImage: null,
});

// Previsualización de la imagen
const imagePreview = ref(null);
const defaultImage = "ruta/a/imagen/por/defecto.jpg"; // Cambia esta ruta según corresponda

// Inicializar datos en modo edición
watch(
    () => props.editData,
    (newData) => {
      if (props.isEditMode) {
        walletData.value = {...newData};
        imagePreview.value = newData.voucherImage || defaultImage;
      } else {
        imagePreview.value = defaultImage;
      }
    },
    {immediate: true}
);

// Manejar subida de imagen
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    walletData.value.voucherImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Cerrar el modal
const closeModal = () => {
  walletData.value = {
    paymentMethod: "",
    network: "",
    walletAddress: "",
    voucherImage: null,
  };
  imagePreview.value = defaultImage;
  emit('update:modelValue', false);
};

// Manejar envío del formulario
const handleSubmit = () => {
  const formData = new FormData();
  formData.append('paymentMethod', walletData.value.paymentMethod);
  formData.append('network', walletData.value.network);
  formData.append('walletAddress', walletData.value.walletAddress);
  if (walletData.value.voucherImage) {
    formData.append('voucherImage', walletData.value.voucherImage);
  }

  if (props.isEditMode) {
    emit('update-wallet', formData);
  } else {
    emit('add-wallet', formData);
  }
  closeModal();
};

// Watch para manejar cambios externos en modelValue
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
      <!-- Modal content -->
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal">
        <!-- Modal header -->
        <div class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Editar Billetera' : 'Agregar Billetera' }}
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
        <!-- Modal body -->
        <form class="p-4 md:p-5 " @submit.prevent="handleSubmit">
          <div class="grid grid-cols-3 gap-6">
            <div class="col-span-1 flex flex-col gap-2.5">
              <label for="paymentMethod" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Método</label>
              <input
                  v-model="walletData.paymentMethod"
                  type="text"
                  id="paymentMethod"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  placeholder="BV"
                  required>
            </div>
            <div class="col-span-2 flex flex-col gap-2.5">
              <label for="network" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Red</label>
              <input
                  v-model="walletData.network"
                  type="text"
                  id="network"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  placeholder="Wallet-Tron (TRC20)"
                  required>
            </div>
            <div class="col-span-3 flex flex-col gap-2.5">
              <label for="walletAddress" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Dirección de Billetera</label>
              <input
                  v-model="walletData.walletAddress"
                  type="text"
                  id="walletAddress"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  placeholder="12eb5cRuXFwaXwKFsqUFS7yYTFVXwsHak9"
                  required>
            </div>
            <div class="col-span-3 mt-5 flex items-center gap-5 ">
              <div>
                <img :src="imagePreview" alt="visualización de voucher" class="w-[100px] h-[100px] object-cover">
              </div>
              <div>
                <label class="mb-3 block text-sm font-medium text-colorTextBlack dark:text-white">
                  Cargar QR
                </label>
                <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="w-full rounded-md border border-stroke p-3 outline-none transition file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:py-1 file:px-2.5 file:text-sm file:font-normal focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30  text-colorTextBlack dark:text-white dark:file:text-white"
                />
              </div>
            </div>
          </div>

          <button
              type="submit"
              class="mt-4 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <Plus class="w-4 h-4 me-2"/>
            {{ isEditMode ? 'Actualizar Billetera' : 'Agregar Billetera' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
