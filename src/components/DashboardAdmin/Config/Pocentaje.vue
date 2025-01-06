<script setup>
import { ref, onMounted, watch } from 'vue';
import CardLayout from "@/layouts/CardLayout.vue";
import { Loader2 } from 'lucide-vue-next';
import { getSystemSettings, updateSystemSettings } from '@/services/system_service';
import { logError } from '@/utils/logger.js';

const isEditable = ref(false);
const isLoading = ref(false);
const withdrawalPercentage = ref(0);
const referralPercentage = ref(0);
const minimumWithdrawal = ref(0);

const toggleEditable = () => {
  isEditable.value = !isEditable.value;
};

const loadSettings = async () => {
  try {
    const settings = await getSystemSettings();
    withdrawalPercentage.value = settings.withdrawal;
    referralPercentage.value = settings.referral;
    minimumWithdrawal.value = settings.minimumWithdrawal;
  } catch (error) {
    logError('Error al cargar la configuración en el componente:', error);
  }
};

const saveSettings = async () => {
  if (!isEditable.value) return;

  isLoading.value = true;
  try {
    await updateSystemSettings(
        withdrawalPercentage.value,
        referralPercentage.value,
        minimumWithdrawal.value
    );
  } catch (error) {
    logError('Error al guardar la configuración en el componente:', error);
  } finally {
    isLoading.value = false;
  }
};

watch([withdrawalPercentage, referralPercentage, minimumWithdrawal], async () => {
  if (isEditable.value) {
    await saveSettings();
  }
});

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <CardLayout class="mt-[30px]">
    <header class="flex items-center justify-between">
      <h2 class="text-colorTextBlack dark:text-white font-semibold text-[20px] md:text-[30px]">
        Porcentajes del sistema
      </h2>
      <div class="flex items-center gap-3">
        <Loader2 v-if="isLoading" class="animate-spin h-5 w-5 text-colorBgButton" />
        <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" class="sr-only peer" v-model="isEditable">
          <div class="relative w-14 h-7 bg-gray-200 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-colorBgButton"></div>
        </label>
      </div>
    </header>
    <form class="mt-[30px] grid grid-cols-6 gap-[20px] lg:gap-[30px]">
      <div class="col-span-6 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">
          % de comisión por retiro
        </label>
        <input
            type="number"
            v-model="withdrawalPercentage"
            placeholder="Porcentaje de retiro"
            :disabled="!isEditable"
            min="0"
            max="100"
            step="0.01"
            :class="[
            'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
            !isEditable ? 'opacity-75 cursor-not-allowed' : ''
          ]"
        >
      </div>
      <div class="col-span-6 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">
          % de Ganancia por referido
        </label>
        <input
            type="number"
            v-model="referralPercentage"
            placeholder="Porcentaje por referido"
            :disabled="!isEditable"
            min="0"
            max="100"
            step="0.01"
            :class="[
            'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
            !isEditable ? 'opacity-75 cursor-not-allowed' : ''
          ]"
        >
      </div>
      <div class="col-span-6 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">
          Mínimo de retiro
        </label>
        <input
            type="number"
            v-model="minimumWithdrawal"
            placeholder="Mínimo de retiro"
            :disabled="!isEditable"
            min="0"
            step="0.01"
            :class="[
            'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
            !isEditable ? 'opacity-75 cursor-not-allowed' : ''
          ]"
        >
      </div>
    </form>
  </CardLayout>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>