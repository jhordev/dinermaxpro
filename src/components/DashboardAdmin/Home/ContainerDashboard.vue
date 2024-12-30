<script setup>

import ContainerCards from "@/components/DashboardAdmin/Home/CardsResumen/ContainerCards.vue";
import ContainerStatusMemberships from "@/components/DashboardAdmin/Home/StatusMemberships.vue";
import Activos from "@/components/DashboardAdmin/Home/Activos.vue";
import SubscribersPlan from "@/components/DashboardAdmin/Home/SubscribersPlan.vue";
</script>

<template>
<main class="grid grid-cols-6 gap-x-[30px] gap-y-[40px]">
  <Activos class="block md:hidden col-span-6 lg:col-span-2" />
  <ContainerCards class="col-span-6" />
  <ContainerStatusMemberships class="col-span-6 lg:col-span-4" />
  <Activos class="hidden md:block col-span-6 lg:col-span-2" />
  <SubscribersPlan class="col-span-6 lg:lg:col-span-4"/>
</main>
</template>
<style scoped>

</style>