<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import FormRetirar from "@/components/Dashboard/Wallet/FormRetirar.vue";
import TableMovimientos from "@/components/Dashboard/Wallet/TableMovimientos.vue";
import { investmentService } from '@/services/investment_service';
import { auth } from '@/services/firebase_config';
import { logError, logInfo } from '@/utils/logger';

const movimientos = ref([]);
const isLoading = ref(true);
let unsubscribe = null;

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

onMounted(async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (userId) {
      unsubscribe = investmentService.subscribeToInvestments((investments) => {
        const userMovements = investments
            .filter(inv => inv.userId === userId)
            .map(inv => ({
              fecha: formatDate(inv.createdAt),
              transaccion: inv.id.slice(0, 8).toUpperCase(),
              operacion: 'Depósito',
              monto: inv.investment,
              status: inv.status,
              network: inv.network,
              paymentMethod: inv.paymentMethod,
              voucherUrl: inv.voucherUrl
            }))
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        movimientos.value = userMovements;
        isLoading.value = false;
        logInfo('Movimientos cargados:', userMovements.length);
      });
    }
  } catch (error) {
    logError('Error al cargar los movimientos:', error);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <section class="flex flex-col md:flex-row gap-[24px]">
    <FormRetirar class="flex-[0.4] h-fit" />
    <TableMovimientos
        :datos="movimientos"
        :isLoading="isLoading"
        class="flex-1"
    />
  </section>
</template>

<style scoped>
/* Agregar estilos si es necesario */
</style>
