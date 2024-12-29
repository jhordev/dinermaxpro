<script setup>

import { Copy, Loader2, UserCircle2, Wallet } from "lucide-vue-next";
import { ref } from 'vue';

const userData = ref({
  photoURL: "https://via.placeholder.com/70",
  nombre: "John Doe",
  email: "johndoe@example.com",
  pais: "Estados Unidos",
  telefono: "+1 123 456 7890",
  referidoPor: "-",
  wallet: "0x123ssdsdsds5151s5d1s5d15s1d5abcd"
});

const showTooltip = ref(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(userData.value.wallet);
  showTooltip.value = true;
  setTimeout(() => {
    showTooltip.value = false;
  }, 2000);
};
</script>

<template>
  <section class="p-5 shadow-custom-card-info rounded-[14px]">
    <header class="w-full flex justify-center pb-2.5 border-b border-gray:50 dark:border-colorGray2">
      <div class="flex flex-col items-center max-w-[208px]">
        <div class="border-8 rounded-full p-1.5">
          <div class="w-[70px] h-[70px] rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img
                :src="userData.photoURL"
                class="w-full h-full object-cover"
                alt="Profile"
            />
          </div>
        </div>
        <h3 class="mt-2.5 text-colorTextBlack dark:text-white text-[16px] font-semibold uppercase text-center">
          {{ userData.nombre }}
        </h3>
        <span class="mt-1.6 text-center text-[12px] text-gray-500">{{ userData.email }}</span>
      </div>
    </header>

    <article class="pt-2.5 text-colorTextBlack dark:text-white">
      <div class="flex p-1.5 items-center justify-between">
        <h3>Pais</h3>
        <h3>{{ userData.pais }}</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Telefono</h3>
        <h3>{{ userData.telefono }}</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Referido por</h3>
        <h3>{{ userData.referidoPor }}</h3>
      </div>
    </article>

    <article class="flex items-center gap-[25px] mt-2.5 p-2.5 bg-colorInputClaro rounded-[6px] relative">
      <div class="bg-white p-1 rounded-[5px]">
        <Wallet />
      </div>
      <span class="truncate">{{ userData.wallet }}</span>
      <button class="cursor-pointer relative flex items-center" @click="copyToClipboard">
        <Copy />
        <span
            v-if="showTooltip"
            class="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10"
        >
        Copiado
      </span>
      </button>
    </article>
  </section>
</template>

<style scoped>

</style>
