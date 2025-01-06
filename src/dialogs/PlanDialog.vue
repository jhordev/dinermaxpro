<script setup>
import { ref, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { planService } from '@/services/plan_service';
import { logError, logInfo } from '@/utils/logger.js';

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
  plan: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'plan-created', 'plan-updated']);
const isLoading = ref(false);

const formData = ref({
  nombrePlan: '',
  capitalMinimo: null,
  capitalMaximo: null,
  tiempoMes: null,
  interes: null,
  porcentajeMinRetiro: null,
  descripcion: ''
});

const closeModal = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  formData.value = {
    nombrePlan: '',
    capitalMinimo: null,
    capitalMaximo: null,
    tiempoMes: null,
    interes: null,
    porcentajeMinRetiro: null,
    descripcion: ''
  };
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    const planData = {
      ...formData.value,
      capitalMinimo: Number(formData.value.capitalMinimo),
      capitalMaximo: Number(formData.value.capitalMaximo),
      tiempoMes: Number(formData.value.tiempoMes),
      interes: Number(formData.value.interes),
      porcentajeMinRetiro: Number(formData.value.porcentajeMinRetiro)
    };

    if (props.mode === 'add') {
      await planService.crearPlan(planData);
      logInfo('Plan creado exitosamente');
      emit('plan-created');
    } else if (props.mode === 'update' && props.plan?.id) {
      await planService.actualizarPlan(props.plan.id, planData);
      logInfo('Plan actualizado exitosamente');
      emit('plan-updated');
    }
    closeModal();
  } catch (error) {
    logError('Error al procesar el plan:', error);
  } finally {
    isLoading.value = false;
  }
};

const validateForm = () => {
  const { nombrePlan, capitalMinimo, capitalMaximo, tiempoMes, interes, porcentajeMinRetiro, descripcion } = formData.value;

  if (!nombrePlan || !capitalMinimo || !capitalMaximo || !tiempoMes || !interes || !porcentajeMinRetiro || !descripcion) {
    logError('Todos los campos son requeridos');
    return false;
  }

  if (capitalMinimo >= capitalMaximo) {
    logError('El capital mínimo debe ser menor que el capital máximo');
    return false;
  }

  if (parseFloat(interes) <= 0) {
    logError('El interés debe ser mayor a 0');
    return false;
  }

  if (parseFloat(porcentajeMinRetiro) < 0 || parseFloat(porcentajeMinRetiro) > 100) {
    logError('El porcentaje mínimo de retiro debe estar entre 0 y 100');
    return false;
  }

  return true;
};

watch(() => props.plan, (newPlan) => {
  if (newPlan) {
    formData.value = { ...newPlan };
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    closeModal();
  }
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
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal">
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

        <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
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

            <div class="col-span-2">
              <div class="grid grid-cols-3 gap-4 max-w-[500px]">
                <div class="col-span-1 flex flex-col gap-2.5">
                  <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Tiempo (mes)</label>
                  <input
                      v-model="formData.tiempoMes"
                      type="number"
                      placeholder="Tiempo (mes)"
                      class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  />
                </div>

                <div class="col-span-1 flex flex-col gap-2.5">
                  <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Interés</label>
                  <input
                      v-model="formData.interes"
                      type="number"
                      step="0.01"
                      placeholder="Interés"
                      class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  />
                </div>

                <div class="col-span-1 flex flex-col gap-2.5">
                  <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">% Mín. Retiro (días)</label>
                  <input
                      v-model="formData.porcentajeMinRetiro"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="% mínimo retiro"
                      class="truncate pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal"
                  />
                </div>
              </div>
            </div>

            <div class="col-span-2 flex flex-col gap-2.5">
              <label class="text-colorTextBlack dark:text-white font-normal text-[14px] md:text-[16px]">Descripción</label>
              <textarea
                  v-model="formData.descripcion"
                  placeholder="Introduzca la descripción"
                  class="pl-5 py-2 md:py-3 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal min-h-[100px]"
              ></textarea>
            </div>
          </div>

          <button
              type="submit"
              :disabled="isLoading"
              class="mt-6 border border-colorBgButton hover:bg-colorBgButton transition-colors duration-300 ease-in-out rounded-[10px] text-colorTextBlack dark:text-white font-bold py-[10px] w-full inline-flex items-center justify-center">
            <Loader2 v-if="isLoading" class="animate-spin mr-2" />
            {{ mode === 'add' ? 'Agregar Plan' : 'Actualizar Plan' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>