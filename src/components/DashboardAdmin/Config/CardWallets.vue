<script setup>
import { defineProps, ref } from 'vue';
import { Trash2, FilePenLine } from 'lucide-vue-next';
import WalletIcon from '@/assets/icons/WalletIcon.vue';

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
    default: null,
  },
  onEdit: {
    type: Function,
    required: true,
  },
  onDelete: {
    type: Function,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false
  }
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
    <div class="flex relative flex-row-reverse gap-2 md:gap-2.5 items-center pt-10 md:pt-0">
      <div class="flex flex-col gap-1.5 md:gap-2.5 w-full">
        <div class=" absolute md:right-0 top-0 flex gap-2">
          <button
              class="group p-1 hover:bg-green-500 rounded-lg text-colorTextBlack dark:text-white"
              @click="onEdit"
              :disabled="isLoading"
          >
            <FilePenLine class="text-current group-hover:text-white"/>
          </button>
          <button
              class="group p-1 hover:bg-red-500 rounded-lg text-colorTextBlack dark:text-white"
              @click="onDelete"
              :disabled="isLoading"
          >
            <Trash2 class="text-current group-hover:text-white"/>
          </button>
        </div>
        <h2 class="text-colorTextBlack dark:text-white font-bold text-[14px]">Forma de pago</h2>
        <div class="text-colorTextBlack dark:text-white flex items-end gap-1 md:gap-3">
          <span class="font-black uppercase text-[25px] md:text-[36px]">{{ paymentMethod }}</span>
          <p class="font-bold text-[12px] md:text-[14px]">Red: {{ network }}</p>
        </div>
        <div
            class="flex justify-between items-center gap-2.5 bg-white dark:bg-colorTextBlack p-2 rounded-[10px] relative"
        >
          <span class="text-[12px] md:text-[14px] truncate text-colorTextBlack dark:text-white">
            {{ walletAddress }}
          </span>
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

      </div>
      <div class="w-[80px] md:w-[150px] h-[80px] md:h-[150px] p-1 absolute top-0 right-0 md:relative flex items-center justify-center border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
        <img
            v-if="qrImage"
            :src="qrImage"
            alt="QR Code"
            class="w-full h-full object-contain"
        />
        <WalletIcon
            v-else
            class="w-12 h-12 md:w-20 md:h-20 text-gray-400 dark:text-gray-500"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
