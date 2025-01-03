<script setup>
import { computed } from 'vue';
import ContainerCards from "@/components/DashboardAdmin/Home/CardsResumen/ContainerCards.vue";
import ContainerStatusMemberships from "@/components/DashboardAdmin/Home/StatusMemberships.vue";
import Activos from "@/components/DashboardAdmin/Home/Activos.vue";
import SubscribersPlan from "@/components/DashboardAdmin/Home/SubscribersPlan.vue";
import ReferidosComponent from "@/components/DashboardAdmin/Home/ReferidosComponent.vue";
import SecureLS from 'secure-ls';

const ls = new SecureLS({ encodingType: 'aes' });

const isAdmin = computed(() => ls.get('user_role') === 'admin');
</script>

<template>
  <main class="grid grid-cols-6 gap-x-[30px] gap-y-[40px]">
    <Activos class="block md:hidden col-span-6 lg:col-span-2" />
    <ContainerCards class="col-span-6" />
    <ContainerStatusMemberships class="col-span-6 lg:col-span-4" />
    <Activos class="hidden md:block col-span-6 lg:col-span-2" />
    <SubscribersPlan class="col-span-6 lg:lg:col-span-4"/>
    <ReferidosComponent
        v-if="!isAdmin"
        class="col-span-6 lg:col-span-2"
    />
  </main>
</template>

<style scoped>
</style>