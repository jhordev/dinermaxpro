<script setup>
import { ref, watch } from 'vue';
import { Loader2, Eye, EyeOff } from 'lucide-vue-next';
import { logError, logInfo } from '@/utils/logger.js';
import { createSocioUser, updateSocioUser } from '@/services/socio_service';

const showPassword = ref(false);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ["add", "update"].includes(value)
  },
  assistant: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'assistant-added', 'assistant-updated']);
const isLoading = ref(false);

const formData = ref({
  email: '',
  nombre: '',
  pais: '',
  registro: new Date().toISOString().split('T')[0],
  password: '',
  estado: 'Activo'
});

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  formData.value = {
    email: '',
    nombre: '',
    pais: '',
    registro: new Date().toISOString().split('T')[0],
    password: '',
    estado: 'Activo'
  };
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    const userData = { ...formData.value };

    if (props.mode === 'add') {
      const result = await createSocioUser(userData);
      logInfo('Socio agregado exitosamente');
      emit('assistant-added', result.userData);
    } else if (props.mode === 'update' && props.assistant) {

      userData.docId = props.assistant.id;

      if (!userData.password || !userData.password.trim()) {
        logError('La contraseña es requerida');
        return;
      }

      const result = await updateSocioUser(userData);
      logInfo('Socio actualizado exitosamente');
      emit('assistant-updated', result.userData);
    }
    closeModal();
  } catch (error) {
    logError('Error al procesar el socio:', error.message);
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const validateForm = () => {
  const {email, nombre, pais, registro, password, estado} = formData.value;

  if (!email || !nombre || !pais || !registro || !password || !estado) {
    logError('Todos los campos son requeridos');
    return false;
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    logError('El email no es válido');
    return false;
  }

  return true;
};

watch(
    () => props.assistant,
    (newAssistant) => {
      if (newAssistant) {
        formData.value = {...newAssistant};
      } else {
        resetForm();
      }
    },
    {immediate: true}
);

watch(
    () => props.modelValue,
    (newValue) => {
      if (!newValue) {
        resetForm();
      }
    }
);
</script>

<template>
  <div
      v-if="modelValue"
      id="crud-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
  >
    <div class="relative p-4 w-full max-w-full md:max-w-fit">
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal">
        <div class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3
              id="modal-title"
              class="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {{ mode === 'add' ? 'Agregar Asistente' : 'Actualizar Asistente' }}
          </h3>
          <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal"
          >
            <svg
                class="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
            >
              <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span class="sr-only">Cerrar modal</span>
          </button>
        </div>

        <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-10 gap-6">
            <div class="col-span-10 flex flex-col gap-2.5">
              <label for="email" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Email</label>
              <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="Correo electrónico"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
              />
            </div>
            <div class="col-span-10 flex flex-col gap-2.5">
              <label for="nombre" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Nombre</label>
              <input
                  id="nombre"
                  v-model="formData.nombre"
                  type="text"
                  placeholder="Nombre completo"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
              />
            </div>
            <div class="col-span-10 lg:col-span-5 flex flex-col gap-2.5">
              <label for="pais" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">País</label>
              <input
                  id="pais"
                  v-model="formData.pais"
                  type="text"
                  placeholder="País"
                  class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
              />
            </div>
            <div class="col-span-10 lg:col-span-5 flex flex-col gap-2.5">
              <label for="password" class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Password</label>
              <div class="flex border rounded-[6px] pr-3">
                <input
                    id="password"
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Contraseña"
                    class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white text-[16px] font-normal w-full"
                />
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="inset-y-0 right-3 flex items-center text-colorTextBlack dark:text-white"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <Eye v-if="!showPassword"/>
                  <EyeOff v-else/>
                </button>
              </div>
            </div>
          </div>

          <button
              type="submit"
              :disabled="isLoading"
              class="mt-6 border border-colorBgButton hover:bg-colorBgButton transition-colors duration-300 ease-in-out rounded-[10px] text-colorTextBlack dark:text-white font-bold py-[10px] w-full inline-flex items-center justify-center"
          >
            <Loader2 v-if="isLoading" class="animate-spin mr-2"/>
            {{ mode === 'add' ? 'Agregar Asistente' : 'Actualizar Asistente' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>