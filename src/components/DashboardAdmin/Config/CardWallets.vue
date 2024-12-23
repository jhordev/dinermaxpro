<script setup>
// Definimos las propiedades (props) para hacer el componente reutilizable
import { defineProps, ref } from 'vue';
import { Trash2, FilePenLine } from 'lucide-vue-next';

defineProps({
  paymentMethod: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  qrImage: {
    type: String,
    required: true,
  },
  onEdit: {
    type: Function,
    required: true,
  },
});

const showTooltip = ref(false);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    showTooltip.value = true;
    setTimeout(() => {
      showTooltip.value = false;
    }, 2000);
  });
};
</script>

<template>
  <section class="rounded-[15px] bg-colorInputClaro p-2.5 shadow-default dark:bg-bgDashboardDark w-full">
    <div class="flex relative flex-row-reverse gap-2 md:gap-2.5 items-center pt-5 md:pt-0">
      <div class="flex flex-col gap-1.5 md:gap-2.5 w-full">
        <h2 class="text-colorTextBlack dark:text-white font-bold text-[14px]">Forma de pago</h2>
        <div class="text-colorTextBlack dark:text-white flex items-end gap-1 d:gap-3">
          <span class="font-black uppercase text-[25px] md:text-[36px]">{{ paymentMethod }}</span>
          <p class="font-bold text-[12px] md:text-[14px]">Red: {{ network }}</p>
        </div>
        <div
            class="flex justify-between items-center gap-2.5 bg-white dark:bg-colorTextBlack p-2 rounded-[10px] relative"
        >
          <span class="text-[12px] md:text-[14px] truncate text-colorTextBlack dark:text-white">{{
              walletAddress
            }}</span>
          <button
              type="button"
              class="border border-colorTextBlack dark:border-gray-50 px-2 py-2 rounded-[5px] text-[10px] text-colorTextBlack dark:text-white"
              @click="copyToClipboard(walletAddress)"
          >
            Copiar
          </button>
          <span
              v-if="showTooltip"
              class="absolute top-[-25px] right-0 bg-gray-700 text-white text-[10px] px-2 py-1 rounded"
          >
            Copiado!
          </span>
        </div>
        <div class="absolute right-0 flex gap-2">
          <button
              class="group p-1 hover:bg-green-500 rounded-lg text-colorTextBlack dark:text-white"
              @click="onEdit"
          >
            <FilePenLine class="text-current group-hover:text-white"/>
          </button>
          <button class="group p-1 hover:bg-red-500 rounded-lg text-colorTextBlack dark:text-white">
            <Trash2 class="text-current group-hover:text-white"/>
          </button>
        </div>
      </div>
      <img :src="qrImage" alt="QR Code" class="w-[80px] md:w-auto absolute top-0 right-0 md:relative"/>
    </div>
  </section>
</template>

<style scoped>
/* Aquí puedes agregar estilos adicionales si es necesario */
</style>
