<script setup>
import { ref } from "vue";
import CardLayout from "@/layouts/CardLayout.vue";
import { Wallet, Copy } from "lucide-vue-next";

const walletAddress = ref("TAvwQKCtokqDd7LrV8YevrqJrBV3aDwDRS");
const showTooltip = ref(false);

// Función para copiar el texto al portapapeles
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(walletAddress.value);
    showTooltip.value = true;
    setTimeout(() => (showTooltip.value = false), 1500); // Ocultar tooltip después de 1.5 segundos
  } catch (error) {
    console.error("Error al copiar al portapapeles:", error);
  }
};
</script>

<template>
  <CardLayout>
    <header class="w-full flex justify-center pb-2.5 border-b border-gray:50 dark:border-colorGray2">
     <div class="flex flex-col  items-center max-w-[208px] ">
       <div class="border-8 rounded-full p-1.5">
         <img src="@/assets/img/profile.jpg" class="rounded-full w-[70px] object-cover" />
       </div>
       <h3 class="mt-2.5 text-colorTextBlack dark:text-white text-[16px] font-semibold uppercase text-center">
         Anibal cortez prada
       </h3>
       <span class="mt-1.6 text-center text-[12px] text-gray-500">0988138790qwe@gmail.com</span>
     </div>
    </header>

    <article class="pt-2.5 text-colorTextBlack dark:text-white">
      <div class="flex p-1.5 items-center justify-between">
        <h3>Pais</h3>
        <h3>Ecuador</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Telefono</h3>
        <h3>+51959659502</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Referido por</h3>
        <h3>DinnerMax</h3>
      </div>
    </article>

    <article class="flex items-center gap-[25px] mt-2.5 p-2.5 bg-colorInputClaro rounded-[6px] relative">
      <div class="bg-white p-1 rounded-[5px]">
        <Wallet />
      </div>
      <span class="truncate">{{ walletAddress }}</span>
      <button
          @click="copyToClipboard"
          class="cursor-pointer relative flex items-center"
      >
        <Copy />
        <!-- Tooltip -->
        <span
            v-if="showTooltip"
            class="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10"
        >
          Copiado
        </span>
      </button>
    </article>
  </CardLayout>
</template>

<style scoped>
/* Ajustes para estilos del tooltip */
button {
  position: relative;
}
button:active span {
  display: block; /* Tooltip visible durante el touch */
}
</style>
