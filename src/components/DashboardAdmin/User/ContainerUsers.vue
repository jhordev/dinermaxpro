<script setup>

import CardLayout from "@/layouts/CardLayout.vue";
import {Search} from "lucide-vue-next";
</script>

<template>
  <main class="grid grid-cols-10 gap-[15px] lg:gap-[22px]">
    <CardLayout class="col-span-10 lg:col-span-3">
      <header class="flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
        <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
          <Search class="text-gray-500"/>
          <input type="text"
                 class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white"
                 placeholder="Buscar...">
        </div>
      </header>
    </CardLayout>
  </main>
</template>

<style scoped>

</style>