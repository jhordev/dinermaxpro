<script setup>
import { ref } from 'vue';
import CardLayout from "@/layouts/CardLayout.vue";

const isEditable = ref(false);

const toggleEditable = () => {
  isEditable.value = !isEditable.value;
};
</script>

<template>
  <CardLayout class="mt-[30px]">
    <header class="flex items-center justify-between">
      <h2 class="text-colorTextBlack dark:text-white font-semibold text-[20px] md:text-[30px]">Porcentajes del sistema</h2>
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" class="sr-only peer" @change="toggleEditable">
        <div class="relative w-14 h-7 bg-gray-200 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-colorBgButton"></div>
      </label>
    </header>
    <form class="mt-[30px] grid grid-cols-4 gap-[20px] lg:gap-[60px]">
      <div class="col-span-4 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Porcentaje de retiro</label>
        <input
            type="number"
            placeholder="Porcentaje de retiro"
            :disabled="!isEditable"
            :class="[
              'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
              !isEditable ? 'opacity-75 cursor-not-allowed' : ''
            ]"
        >
      </div>
      <div class="col-span-4 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Porcentaje de Ganancia por referido</label>
        <input
            type="number"
            placeholder="Porcentaje por referido"
            :disabled="!isEditable"
            :class="[
              ' pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
              !isEditable ? 'opacity-75 cursor-not-allowed' : ''
            ]"
        >
      </div>
    </form>
  </CardLayout>
</template>

<style scoped>
</style>