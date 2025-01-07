<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CardLayout from "@/layouts/CardLayout.vue";
import { investmentService } from '@/services/investment_service';
import { subscribeToUserWithdrawals } from '@/services/withdrawal_service';
import { logError, logInfo } from '@/utils/logger';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const transactions = ref([]);
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const updateTransactions = () => {
  transactions.value.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

onMounted(async () => {
  try {
    // Suscripción a depósitos
    unsubscribeInvestments = investmentService.subscribeToInvestments((investments) => {
      const depositTransactions = investments
          .filter(inv => inv.userId === props.userId)
          .map(inv => ({
            fecha: formatDate(inv.createdAt),
            transaccion: inv.id.slice(0, 8).toUpperCase(),
            operacion: 'Depósito',
            monto: inv.investment,
            status: inv.status,
            timestamp: inv.createdAt
          }));

      // Actualizar solo los depósitos
      transactions.value = transactions.value
          .filter(t => t.operacion === 'Retiro')
          .concat(depositTransactions);

      updateTransactions();
      isLoading.value = false;
      logInfo('Depósitos cargados:', depositTransactions.length);
    });

    // Suscripción a retiros
    unsubscribeWithdrawals = subscribeToUserWithdrawals((withdrawals) => {
      const withdrawalTransactions = withdrawals
          .filter(w => w.userId === props.userId)
          .map(w => ({
            fecha: formatDate(w.createdAt),
            transaccion: w.id.slice(0, 8).toUpperCase(),
            operacion: 'Retiro',
            monto: w.netAmount,
            status: w.status,
            timestamp: w.createdAt
          }));

      // Actualizar solo los retiros
      transactions.value = transactions.value
          .filter(t => t.operacion === 'Depósito')
          .concat(withdrawalTransactions);

      updateTransactions();
      isLoading.value = false;
      logInfo('Retiros cargados:', withdrawalTransactions.length);
    });

  } catch (error) {
    logError('Error al cargar las transacciones:', error);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribeInvestments) unsubscribeInvestments();
  if (unsubscribeWithdrawals) unsubscribeWithdrawals();
});
</script>

<template>
  <CardLayout>
    <header class="flex justify-between items-center mb-4">
      <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
        Últimos movimientos
      </h2>
      <router-link
          to="/dashboard/wallet"
          class="text-[16px] text-colorGraydark tracking-[1.6px] font-bold hover:underline"
      >
        Ver todo
      </router-link>
    </header>

    <div v-if="isLoading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="transactions.length > 0" class="overflow-x-auto mt-5">
      <table class="w-full table-auto border-collapse text-left">
        <thead>
        <tr class="bg-transparent">
          <th class="p-4 text-sm font-medium uppercase text-black dark:text-white">Fecha</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Transacción</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Operación</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Monto</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Estado</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(transaction, index) in transactions"
            :key="transaction.transaccion"
            :class="index % 2 === 0 ? 'bg-transparent' : 'bg-bgf3 dark:bg-colorfila'"
        >
          <td class="p-4 text-[14px] font-normal text-colorTextBlack dark:text-white">
            {{ transaction.fecha }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">
            {{ transaction.transaccion }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">
            {{ transaction.operacion }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">
            {{ formatCurrency(transaction.monto) }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center">
              <span
                  :class="{
                  'px-2 py-1 rounded-full text-xs font-semibold': true,
                  'bg-green-100 text-green-800': transaction.status === 'approved' || transaction.status === 'completed',
                  'bg-yellow-100 text-yellow-800': transaction.status === 'pending',
                  'bg-red-100 text-red-800': transaction.status === 'rejected'
                }"
              >
                {{
                  transaction.status === 'approved' || transaction.status === 'completed' ? 'Aprobado' :
                      transaction.status === 'pending' ? 'Pendiente' : 'Rechazado'
                }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-8 text-colorGraydark">
      No hay movimientos disponibles
    </div>
  </CardLayout>
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