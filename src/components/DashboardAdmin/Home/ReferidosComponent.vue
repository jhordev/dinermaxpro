<script setup>
import { Copy, Loader } from 'lucide-vue-next';
import CardLayout from "@/layouts/CardLayout.vue";
import { ref } from 'vue';

// Variables reactivas
const copied = ref(false);
const loading = ref(false);

// Función para copiar al portapapeles
const handleCopy = async () => {
  loading.value = true;
  try {
    const link = "redsdsdsdsdsdmskdsjndsmdksdsmdksd";
    await navigator.clipboard.writeText(link);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Error al copiar el enlace: ", error);
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <CardLayout>
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Link de referidos
    </h2>
    <div class="mt-5">
      <label class="font-semibold text-[14px] text-colorGraydark">
        Copia el link y comparte a tus amigos
      </label>
      <div class="mt-1.5 flex w-full bg-colorInputClaro p-2.5 rounded-[6px] gap-4 items-center">
        <span class="truncate text-[14px]">
          redsdsdsdsdsdmskdsjndsmdksdsmdksd
        </span>
        <button
            @click="handleCopy"
            class="flex items-center gap-2 cursor-pointer text-[12px] text-colorTextBlack font-bold border border-colorBorder md:border-transparent md:hover:border-colorBorder p-1 rounded-[5px] transition-all duration-300 ease-in-out"
            :disabled="loading"
        >
          <Loader v-if="loading" class="animate-spin h-4 w-4" />
          <template v-else>
            <Copy class="h-4 w-4" />
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </template>
        </button>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <div class="relative w-[80px] h-[80px]">
        <img
            src="@/assets/img/item1.png"
            class="rounded-full w-[80px] h-[80px] object-cover"
            alt="Imagen de referidos"
        />

      </div>
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Total de referidos</h3>
        <strong class="font-bold text-[23px]">50</strong>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <div class="relative w-[80px] h-[80px]">
        <img
            src="@/assets/img/item2.png"
            class="rounded-full w-[80px] h-[80px] object-cover"
            alt="Imagen de dinero"
        />
      </div>
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Ganancia Total</h3>
        <strong class="font-bold text-[23px]">$ 5000</strong>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
</style>
