<script setup>
import { ref, watch } from 'vue';
import CardFormadePago from "@/components/Dashboard/Shared/CardFormadePago.vue";
import imgVoucher from '@/assets/img/imgview.png';
import { Equal } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ["add", "update"].includes(value)
  }
});

const defaultImage = imgVoucher;

// Emit event for two-way binding
const emit = defineEmits(['update:modelValue']);

// Variables para cada input del formulario
const formData = ref({
  nombrePlan: '',
  capitalMinimo: null,
  capitalMaximo: null,
  tiempoMes: null,
  interes: null,
  descripcion: ''
});

// Ref para previsualización de la imagen
const imagePreview = ref(defaultImage);

// Función para cerrar el modal
const closeModal = () => {
  imagePreview.value = defaultImage; // Restablecer imagen a la predeterminada
  emit('update:modelValue', false);
  resetForm();
};

// Función para manejar la subida de imágenes
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imagePreview.value = URL.createObjectURL(file);
  }
};

// Función para restablecer el formulario
const resetForm = () => {
  formData.value = {
    nombrePlan: '',
    capitalMinimo: null,
    capitalMaximo: null,
    tiempoMes: null,
    interes: null,
    descripcion: ''
  };
};

// Observar cambios externos en modelValue
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
            {{ mode === 'add' ? 'Nuevo Plan' : 'Actualizar Plan' }}
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
        <form class="p-4 md:p-5 " @submit.prevent="">
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Nombre del Plan</label>
              <input v-model="formData.nombrePlan" type="text" placeholder="Introduzca nombre del plan" class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal" />
            </div>
            <div class="col-span-1 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Capital mínimo</label>
              <input v-model="formData.capitalMinimo" type="number" placeholder="Capital mínimo" class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal" />
            </div>
            <div class="col-span-1 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Capital máximo</label>
              <input v-model="formData.capitalMaximo" type="number" placeholder="Capital máximo" class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal" />
            </div>
            <div class="col-span-1 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Tiempo (mes)</label>
              <input v-model="formData.tiempoMes" type="number" placeholder="Tiempo (mes)" class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal" />
            </div>
            <div class="col-span-1 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Interés</label>
              <input v-model="formData.interes" type="number" placeholder="Interés" class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal" />
            </div>
            <div class="col-span-2 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Descripción</label>
              <textarea v-model="formData.descripcion" type="text" placeholder="Introduzca la descripción" class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"></textarea>
            </div>
          </div>

          <button
              type="submit"
              class="mt-6 border border-colorBgButton hover:bg-colorBgButton transition-colors duration-300 ease-in-out rounded-[10px] text-colorTextBlack dark:text-white font-bold py-[10px] w-full">
            {{ mode === 'add' ? 'Agregar Plan' : 'Actualizar Plan' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
