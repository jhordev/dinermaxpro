<script setup>
import { ref, computed } from 'vue';
import {ChevronDown, FileText, Search, Sheet, ChevronLeft, ChevronRight} from "lucide-vue-next";

// Variables reactivas
const currentPage = ref(1);
const itemsPerPage = ref(5);
const searchTerm = ref(''); // Término de búsqueda
const dropdownOpen = ref(false); // Estado del dropdown

// Función para toggle del dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Datos simulados (puedes reemplazarlos por tu lista real)
const transactions = ref([
  { fecha: '2023-01-01', transaccion: 'TX12345', operacion: 'Depósito', monto: 1000 },
  { fecha: '2023-01-02', transaccion: 'TX12346', operacion: 'Retiro', monto: -500 },
  { fecha: '2023-01-03', transaccion: 'TX12347', operacion: 'Depósito', monto: 2000 },
  { fecha: '2023-01-04', transaccion: 'TX12348', operacion: 'Transferencia', monto: -150 },
  { fecha: '2023-01-05', transaccion: 'TX12349', operacion: 'Depósito', monto: 500 },
  { fecha: '2023-01-06', transaccion: 'TX12350', operacion: 'Retiro', monto: -700 },
  { fecha: '2023-01-07', transaccion: 'TX12351', operacion: 'Depósito', monto: 300 },
  { fecha: '2023-01-08', transaccion: 'TX12352', operacion: 'Transferencia', monto: -250 },
  { fecha: '2023-01-09', transaccion: 'TX12353', operacion: 'Depósito', monto: 100 },
  { fecha: '2023-01-10', transaccion: 'TX12354', operacion: 'Retiro', monto: -50 },
]);

// Filtro de búsqueda
const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const search = searchTerm.value.toLowerCase();
    return (
        transaction.fecha.toLowerCase().includes(search) ||
        transaction.transaccion.toLowerCase().includes(search) ||
        transaction.operacion.toLowerCase().includes(search) ||
        transaction.monto.toString().toLowerCase().includes(search)
    );
  });
});

// Cálculos relacionados con la paginación
const totalItems = computed(() => filteredTransactions.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

// Métodos para la paginación
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Rango de páginas para mostrar en el paginador
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

// Rango de elementos visibles
const showingFrom = computed(() => ((currentPage.value - 1) * itemsPerPage.value) + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));
</script>

<template>
    <section  class="shadow-custom-card-info rounded-[15px] bg-bgCardLigth p-5 md:p-6 shadow-default dark:bg-bgDashboardDark w-full ">
      <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
        Historial de Movimientos
      </h2>
      <!-- Search bar -->
      <header class="mt-5 flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
        <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
          <Search class="text-gray-500" />
          <input type="text" v-model="searchTerm" class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white" placeholder="Buscar...">
        </div>
        <div class="relative">
          <button @click="toggleDropdown" id="dropdownActionButton" class="py-2.5 rounded-[15px] inline-flex items-center text-gray-500 focus:outline-none hover:bg-gray-100 font-medium text-sm px-3 dark:bg-gray-800 dark:text-gray-400 bg-colorInputClaro" type="button">
            Exportar
            <ChevronDown class="ml-1.5 w-5" />
          </button>

          <!-- Dropdown Menu -->
          <div v-if="dropdownOpen" id="dropdownAction" class="absolute top-10 right-0 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
            <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
              <li>
                <a href="#" class="flex items-center text-[12px] md:text-[16px] font-semibold gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <Sheet />
                  Excel
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center text-[12px] md:text-[16px] font-semibold gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <FileText />
                  PDF
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Tabla -->
      <div class="overflow-x-auto mt-5">
        <table class="w-full table-auto border-collapse text-left">
          <thead>
          <tr class="bg-transparent">
            <th class="p-4 text-sm font-medium uppercase text-black dark:text-white">Fecha</th>
            <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Transacción</th>
            <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Operación</th>
            <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Monto</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(transaction, index) in paginatedTransactions"
              :key="index"
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
              $ {{ transaction.monto }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
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
                :class="[page === '...' ? 'text-gray-500 dark:bg-gray-800 ' : (currentPage === page ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white')]"
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

</style>
