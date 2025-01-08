<script setup>
import {computed, ref} from 'vue';
import ContainerCards from "@/components/DashboardAdmin/Home/CardsResumen/ContainerCards.vue";
import ContainerStatusMemberships from "@/components/DashboardAdmin/Home/StatusMemberships.vue";
import Activos from "@/components/DashboardAdmin/Home/Activos.vue";
import SubscribersPlan from "@/components/DashboardAdmin/Home/SubscribersPlan.vue";
import ReferidosComponent from "@/components/DashboardAdmin/Home/ReferidosComponent.vue";
import SecureLS from 'secure-ls';
import SwitchDashboard from "@/components/DashboardAdmin/Home/SwitchDashboard.vue";
import PdfPreviewhtml from "@/components/DashboardAdmin/Shared/PdfPreviewhtml.vue";

const ls = new SecureLS({encodingType: 'aes'});

// Determina si el usuario es admin
const isAdmin = computed(() => ls.get('user_role') === 'admin');

const handleToggle = (value) => {
  console.log('Switch toggled:', value);
};
</script>

<template>
  <PdfPreviewhtml/>
  <!-- Switch para admin -->
  <SwitchDashboard v-if="isAdmin" @switchToggled="handleToggle" class="mb-6"/>
  <!-- Resto del contenido -->
  <main class="grid grid-cols-6 gap-x-[30px] gap-y-[40px]">
    <Activos class="block md:hidden col-span-6 lg:col-span-2"/>
    <ContainerCards class="col-span-6"/>
    <ContainerStatusMemberships class="col-span-6 lg:col-span-4"/>
    <Activos class="hidden md:block col-span-6 lg:col-span-2"/>
    <SubscribersPlan class="col-span-6 lg:lg:col-span-4"/>
    <ReferidosComponent
        v-if="!isAdmin"
        class="col-span-6 lg:col-span-2"
    />
  </main>
</template>

<style scoped>
</style>
