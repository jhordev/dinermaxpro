<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { getAuth } from 'firebase/auth';
import ReferidosComponent from "@/components/DashboardAdmin/Home/ReferidosComponent.vue";
import TableReferences from "@/components/DashboardAdmin/ReferencesSocios/TableReferences.vue";
import { referralService } from '@/services/referral_service';
import { logError, logInfo } from '@/utils/logger';

const movimientos = ref([]);
let unsubscribe = null;

onMounted(() => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    // Agregamos el log del UID
    logInfo(`UID del usuario actual: ${currentUser.uid}`);

    try {
      unsubscribe = referralService.getReferralHistory(
          currentUser.uid,
          (data) => {
            movimientos.value = data;
          }
      );
    } catch (error) {
      logError('Error al obtener historial de referidos:', error);
    }
  } else {
    logInfo('No hay usuario autenticado');
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
    <ReferidosComponent class="h-fit"/>
    <TableReferences :datos="movimientos" class="col-span-1 md:col-span-2"/>
  </section>
</template>

<style scoped>
</style>