<script setup>

import Wallets from "@/components/DashboardAdmin/Config/Wallets.vue";
</script>

<template>
  <nav class="bg-[#EAE8F4] dark:bg-black p-[5px] gap-[10px] flex flex-row items-center rounded-[8px] w-fit">
    <RouterLink to="/admin/configurations/wallets" class="p-2.5 rounded-[5px] font-medium text-colorTextBlack dark:text-white bg-transparent hover:bg-white dark:bg-transparent dark:hover:bg-colorInput "> Billeteras </RouterLink>
    <RouterLink to="/admin/configurations/recompensas" class="p-2.5 rounded-[5px] font-medium text-colorTextBlack dark:text-white bg-transparent hover:bg-white dark:bg-transparent dark:hover:bg-colorInput "> Recompensas </RouterLink>
    <RouterLink to="/admin/configurations/profile" class="p-2.5 rounded-[5px] font-medium text-colorTextBlack dark:text-white bg-transparent hover:bg-white dark:bg-transparent dark:hover:bg-colorInput "> Perfil </RouterLink>
  </nav>
  <RouterView/>
</template>

<style scoped>

</style>