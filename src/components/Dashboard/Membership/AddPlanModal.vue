<script setup>
import { ref, watch } from 'vue';
import CardFormadePago from "@/components/Dashboard/Shared/CardFormadePago.vue";
import imgVoucher from '@/assets/img/imgview.png'
import {Equal} from 'lucide-vue-next'
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const defaultImage = imgVoucher;
// Emit event for two-way binding
const emit = defineEmits(['update:modelValue']);

// Add ref for image preview
const imagePreview = ref(defaultImage);

// Close modal function
const closeModal = () => {
  imagePreview.value = defaultImage; // Reset image to default
  emit('update:modelValue', false);
};

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imagePreview.value = URL.createObjectURL(file);
  }
};

// Watch for external changes to modelValue
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
      id="crud-modal"
      tabindex="-1"
      aria-hidden="true"
      class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
    <div class="relative p-4 w-full max-w-full md:max-w-fit">
      <!-- Modal content -->
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal ">
        <!-- Modal header -->
        <div class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Elegiste el plan Básico
          </h3>
          <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <form class="p-4 md:p-5 ">
          <!-- Calculadora -->
          <div class="flex flex-row items-center gap-5 md:gap-8 flex-wrap">
            <div class="flex-1 md:flex-auto">
              <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tu inversión</label>
              <input
                  type="number"
                  name="price"
                  id="price"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="$ 2999"
                  required>
            </div>
            <div class="flex-0.5 md:flex-0.5">
              <label for="price" class=" block mb-2 text-sm font-medium text-gray-900 dark:text-white">I %</label>
              <div class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                0.5 %
              </div>
            </div>
              <Equal class="text-colorTextBlack dark:text-white" />
            <div class="flex-1 md:flex-auto">
              <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ganancias</label>
              <div class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                $ 10 000
              </div>
            </div>
          </div>
          <CardFormadePago class="mt-6"/>
          <!-- Subir vaucher -->
          <div class="mt-5 flex items-center gap-5 ">
            <div>
              <img :src="imagePreview" alt="visualización de voucher" class="w-[100px] h-[100px] object-cover">
            </div>
            <div>
              <label class="mb-3 block text-sm font-medium text-colorTextBlack dark:text-white">
                Cargar Voucher
              </label>
              <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="w-full rounded-md border border-stroke p-3 outline-none transition file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:py-1 file:px-2.5 file:text-sm file:font-normal focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30  text-colorTextBlack dark:text-white dark:file:text-white"
              />
            </div>
          </div>
          <button
              type="submit"
              class=" mt-10 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
            Add new product
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>