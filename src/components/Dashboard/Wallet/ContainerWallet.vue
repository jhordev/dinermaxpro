<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import FormRetirar from "@/components/Dashboard/Wallet/FormRetirar.vue";
import TableMovimientos from "@/components/Dashboard/Wallet/TableMovimientos.vue";
import { investmentService } from '@/services/investment_service';
import { subscribeToUserWithdrawals } from '@/services/withdrawal_service';
import { auth } from '@/services/firebase_config';
import { logError, logInfo } from '@/utils/logger';

const movimientos = ref([]);
const isLoading = ref(true);
let unsubscribeInvestments = null;
let unsubscribeWithdrawals = null;

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
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
      // Suscripción a depósitos
      unsubscribeInvestments = investmentService.subscribeToInvestments((investments) => {
        const depositMovements = investments
            .filter(inv => inv.userId === userId)
            .map(inv => ({
              fecha: formatDate(inv.createdAt),
              transaccion: inv.id.slice(0, 8).toUpperCase(),
              operacion: 'Depósito',
              monto: inv.investment,
              status: inv.status,
              network: inv.network,
              paymentMethod: inv.paymentMethod,
              voucherUrl: inv.voucherUrl,
              timestamp: inv.createdAt
            }));

        // Actualizar solo los depósitos manteniendo los retiros existentes
        movimientos.value = movimientos.value
            .filter(m => m.operacion === 'Retiro')
            .concat(depositMovements);

        ordenarMovimientos();
        isLoading.value = false;
        logInfo('Depósitos cargados:', depositMovements.length);
      });

      // Suscripción a retiros
      unsubscribeWithdrawals = subscribeToUserWithdrawals((withdrawals) => {
        const withdrawalMovements = withdrawals
            .filter(w => w.userId === userId)
            .map(w => ({
              fecha: formatDate(w.createdAt),
              transaccion: w.id.slice(0, 8).toUpperCase(),
              operacion: 'Retiro',
              monto: w.netAmount,
              status: w.status,
              network: w.network || '',
              paymentMethod: 'Wallet',
              voucherUrl: '',
              comision: w.withdrawalFee,
              billetera: w.walletAddress,
              timestamp: w.createdAt
            }));

        // Actualizar solo los retiros manteniendo los depósitos existentes
        movimientos.value = movimientos.value
            .filter(m => m.operacion === 'Depósito')
            .concat(withdrawalMovements);

        ordenarMovimientos();
        isLoading.value = false;
        logInfo('Retiros cargados:', withdrawalMovements.length);
      });
    }
  } catch (error) {
    logError('Error al cargar los movimientos:', error);
    isLoading.value = false;
  }
});

const ordenarMovimientos = () => {
  movimientos.value.sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
    const dateB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
    return dateB - dateA;
  });
};

onUnmounted(() => {
  if (unsubscribeInvestments) unsubscribeInvestments();
  if (unsubscribeWithdrawals) unsubscribeWithdrawals();
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
