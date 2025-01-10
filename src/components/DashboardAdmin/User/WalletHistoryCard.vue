<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Search, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { investmentService } from '@/services/investment_service';
import { subscribeToUserWithdrawals } from '@/services/withdrawal_service';
import { logError, logInfo } from '@/utils/logger';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const currentPage = ref(1);
const itemsPerPage = ref(5);
const searchTerm = ref('');
const dropdownOpen = ref(false);
const isLoading = ref(true);
const transactions = ref([]);
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' USDT';
};

const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const search = searchTerm.value.toLowerCase();
    return (
        transaction.fecha.toLowerCase().includes(search) ||
        transaction.transaccion.toLowerCase().includes(search) ||
        transaction.operacion.toLowerCase().includes(search) ||
        transaction.network?.toLowerCase().includes(search) ||
        transaction.monto.toString().toLowerCase().includes(search)
    );
  });
});

onMounted(async () => {
  try {
    if (props.userId) {
      // Suscripción a depósitos
      unsubscribeInvestments = investmentService.subscribeToInvestments((investments) => {
        const depositMovements = investments
            .filter(inv => inv.userId === props.userId)
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

        transactions.value = transactions.value
            .filter(m => m.operacion === 'Retiro')
            .concat(depositMovements);

        ordenarTransacciones();
        isLoading.value = false;
        logInfo('Depósitos cargados:', depositMovements.length);
      });

      // Suscripción a retiros
      unsubscribeWithdrawals = subscribeToUserWithdrawals((withdrawals) => {
        const withdrawalMovements = withdrawals
            .filter(w => w.userId === props.userId)
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

        transactions.value = transactions.value
            .filter(m => m.operacion === 'Depósito')
            .concat(withdrawalMovements);

        ordenarTransacciones();
        isLoading.value = false;
        logInfo('Retiros cargados:', withdrawalMovements.length);
      });
    }
  } catch (error) {
    logError('Error al cargar las transacciones:', error);
    isLoading.value = false;
  }
});

const ordenarTransacciones = () => {
  transactions.value.sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
    const dateB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
    return dateB - dateA;
  });
};

onUnmounted(() => {
  if (unsubscribeInvestments) unsubscribeInvestments();
  if (unsubscribeWithdrawals) unsubscribeWithdrawals();
});

const totalItems = computed(() => filteredTransactions.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

defineExpose({
  transactions,
  formatCurrency
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const paginationRange = computed(() => {
  const range = [];
  const maxPages = totalPages.value;
  let startPage = currentPage.value - 1;
  let endPage = currentPage.value + 1;

  if (startPage < 1) startPage = 1;
  if (endPage > maxPages) endPage = maxPages;

  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }

  if (startPage > 2) range.unshift('...');
  if (endPage < maxPages - 1) range.push('...');

  return range;
});

const showingFrom = computed(() => ((currentPage.value - 1) * itemsPerPage.value) + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));
</script>

<template>
  <section class="shadow-custom-card-info rounded-[15px] bg-bgCardLigth p-5 md:p-6 shadow-default dark:bg-bgDashboardDark w-full">
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Historial de Movimientos
    </h2>

    <header class="mt-5 flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
      <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
        <Search class="text-gray-500" />
        <input
            type="text"
            v-model="searchTerm"
            class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white"
            placeholder="Buscar..."
        >
      </div>
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
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Red</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Monto</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Estado</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(transaction, index) in paginatedTransactions"
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
            {{ transaction.network || '-' }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">
            {{ formatCurrency(transaction.monto) }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center">
              <span
                  :class="{
                  'px-2 py-1 rounded-full text-xs font-semibold': true,
                  'bg-green-100 text-green-800':
                    (transaction.operacion === 'Depósito' && transaction.status === 'approved') ||
                    (transaction.operacion === 'Retiro' && transaction.status === 'completed'),
                  'bg-yellow-100 text-yellow-800':
                    (transaction.operacion === 'Depósito' && transaction.status === 'pending') ||
                    (transaction.operacion === 'Retiro' && transaction.status === 'pending'),
                  'bg-blue-100 text-blue-800':
                    transaction.operacion === 'Retiro' && transaction.status === 'processing'
                }"
              >
                {{
                  transaction.operacion === 'Depósito'
                      ? (transaction.status === 'approved' ? 'Aprobado' : 'Pendiente')
                      : (transaction.status === 'completed' ? 'Completado' :
                          transaction.status === 'processing' ? 'Procesando' : 'Pendiente')
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

    <nav class="flex flex-row items-center gap-3 pt-4 md:justify-between" aria-label="Table navigation">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400 block w-full md:inline md:w-auto">
        <span class="hidden md:inline-block">Mostrando</span>
        <span class="font-semibold text-gray-900 dark:text-white">{{ showingFrom }}-{{ showingTo }}</span>
        de <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
      </span>

      <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
          <a
              href="#"
              @click.prevent="previousPage"
              class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            <ChevronLeft />
          </a>
        </li>
        <li v-for="(page, index) in paginationRange" :key="index">
          <a
              href="#"
              @click.prevent="page !== '...' && changePage(page)"
              class="flex items-center justify-center px-3 h-8 leading-tight"
              :class="[
              page === '...' ? 'text-gray-500 dark:bg-gray-800' :
              (currentPage === page ?
                'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' :
                'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white')
            ]"
          >
            {{ page }}
          </a>
        </li>
        <li>
          <a
              href="#"
              @click.prevent="nextPage"
              class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
          >
            <ChevronRight />
          </a>
        </li>
      </ul>
    </nav>
  </section>
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