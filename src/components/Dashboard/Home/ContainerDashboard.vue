<script setup>
import { ref, onMounted } from 'vue';
import ReferidosComponent from "@/components/Dashboard/Home/ReferidosComponent.vue";
import MembershipComponent from "@/components/Dashboard/Home/MembershipComponent.vue";
import TotalComponent from "@/components/Dashboard/Home/TotalComponent.vue";
import MovementsComponent from "@/components/Dashboard/Home/MovementsComponent.vue";
import ProfileCardComponent from "@/components/Dashboard/Home/ProfileCardComponent.vue";
import ActivosComponent from "@/components/Dashboard/Home/ActivosComponent.vue";
import { auth } from '@/services/firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { logError, logInfo } from '@/utils/logger';

const currentUserId = ref(null);
const isLoading = ref(true);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId.value = user.uid;
      logInfo('Usuario autenticado:', user.uid);
    } else {
      currentUserId.value = null;
      logError('No hay usuario autenticado');
    }
    isLoading.value = false;
  });
});
</script>

<template>
  <ActivosComponent />

  <main class="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,400px)] mt-5 md:mt-10 gap-10">
    <section class="flex flex-col gap-10">
      <!-- Estado de carga -->
      <div v-if="isLoading" class="flex justify-center items-center p-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Contenido cuando no está cargando -->
      <template v-else>
        <!-- Si hay usuario autenticado -->
        <template v-if="currentUserId">
          <TotalComponent :userId="currentUserId" />
          <MembershipComponent :userId="currentUserId" />
          <MovementsComponent :userId="currentUserId" />
        </template>

        <!-- Si no hay usuario autenticado -->
        <div v-else class="text-center py-8 bg-red-50 rounded-lg">
          <p class="text-red-600">Por favor, inicia sesión para ver tu información</p>
        </div>
      </template>
    </section>

    <section class="flex flex-col gap-10">
      <ProfileCardComponent />
      <ReferidosComponent />
    </section>
  </main>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>