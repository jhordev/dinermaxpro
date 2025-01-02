<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (path) => route.path === path ? 'bg-white dark:bg-colorInput' : 'bg-transparent';
</script>

<template>
  <nav class="bg-[#EAE8F4] dark:bg-black p-[5px] gap-[10px] flex flex-row items-center rounded-[8px] w-fit">
    <RouterLink
        to="/admin/configurations/wallets"
        :class="[isActive('/admin/configurations/wallets'), 'p-2.5 rounded-[5px] font-medium text-colorTextBlack dark:text-white hover:bg-white dark:hover:bg-colorInput']">
      Billeteras
    </RouterLink>
    <RouterLink
        to="/admin/configurations/recompensas"
        :class="[isActive('/admin/configurations/recompensas'), 'p-2.5 rounded-[5px] font-medium text-colorTextBlack dark:text-white hover:bg-white dark:hover:bg-colorInput']">
      Porcentajes
    </RouterLink>
  </nav>
  <RouterView/>
</template>

<style scoped>
</style>
