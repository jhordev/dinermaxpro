<script setup>
import { ref, computed } from 'vue';
import {ChevronDown, FileText, Search, ChevronLeft, ChevronRight, Eye, XCircle} from 'lucide-vue-next';
import CardLayout from '@/layouts/CardLayout.vue';

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
  { usuario: 'Juan Pérez', fecha: '2023-01-01', billetera: 'BTC', transaccion: 'TX12345', operacion: 'Depósito', monto: 1000, estado: 'Completado' },
  { usuario: 'Ana Gómez', fecha: '2023-01-02', billetera: 'ETH', transaccion: 'TX12346', operacion: 'Retiro', monto: -500, estado: 'Pendiente' },
  { usuario: 'Luis Rodríguez', fecha: '2023-01-03', billetera: 'USDT', transaccion: 'TX12347', operacion: 'Depósito', monto: 2000, estado: 'Completado' },
  { usuario: 'María López', fecha: '2023-01-04', billetera: 'BTC', transaccion: 'TX12348', operacion: 'Transferencia', monto: -150, estado: 'Fallido' },
  { usuario: 'Carlos Sánchez', fecha: '2023-01-05', billetera: 'ETH', transaccion: 'TX12349', operacion: 'Depósito', monto: 500, estado: 'Completado' },
  { usuario: 'Carlos Sánchez', fecha: '2023-01-05', billetera: 'ETH', transaccion: 'TX12349', operacion: 'Depósito', monto: 500, estado: 'Completado' },
]);

//Modal
const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

// Filtro de búsqueda
const filteredTransactions = computed(() => {
  return transactions.value.filter((transaction) => {
    const search = searchTerm.value.toLowerCase();
    return (
        transaction.usuario.toLowerCase().includes(search) ||
        transaction.fecha.toLowerCase().includes(search) ||
        transaction.billetera.toLowerCase().includes(search) ||
        transaction.transaccion.toLowerCase().includes(search) ||
        transaction.operacion.toLowerCase().includes(search) ||
        transaction.monto.toString().toLowerCase().includes(search) ||
        transaction.estado.toLowerCase().includes(search)
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
const showingFrom = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));
</script>

<template>
  <CardLayout>
    <header class="flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
      <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
        <Search class="text-gray-500"/>
        <input
            type="text"
            v-model="searchTerm"
            class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white"
            placeholder="Buscar..."
        />
      </div>
    </header>

    <!-- Tabla -->
    <div class="overflow-x-auto mt-5">
      <table class="w-full table-auto border-collapse text-left">
        <thead>
        <tr class="bg-transparent">
          <th class="p-4 text-sm font-medium uppercase text-colorTextBlack   dark:text-white">Usuario</th>
          <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center  dark:text-white">Fecha</th>
          <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center  dark:text-white">Billetera</th>
          <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center  dark:text-white">Monto</th>
          <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center  dark:text-white">Estado</th>
          <th class="p-4 text-sm font-medium uppercase text-colorTextBlack dark:text-white text-center">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(transaction, index) in paginatedTransactions"
            :key="index"
            :class="index % 2 === 0 ? 'bg-transparent' : 'bg-bgf3 dark:bg-colorfila'"
        >
          <td class="p-4 text-[14px] font-normal text-colorTextBlack dark:text-white">
            {{ transaction.usuario }}
          </td>
          <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
            {{ transaction.fecha }}
          </td>
          <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
            {{ transaction.billetera }}
          </td>
          <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
            $ {{ transaction.monto }}
          </td>
          <td class="p-4 text-[14px] text-center font-normal text-white">
            <span
                class="p-1 flex justify-center font-bold rounded-[5px] "
                :class="{
                    'bg-[#03A66D]': transaction.estado === 'Completado',
                    'bg-[#DAAA39]': transaction.estado === 'Pendiente',
                    'bg-[#DC2626]': transaction.estado === 'Fallido',
                    }"
            >
              {{ transaction.estado }}
            </span>
          </td>
          <td class="p-4 text-[14px] flex justify-center font-normal text-center text-colorTextBlack dark:text-white">
            <div class="flex items-center gap-2">
             <div>
               <label class="inline-flex items-center cursor-pointer">
                 <input type="checkbox" value="" class="sr-only peer">
                 <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
               </label>
             </div>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <nav
        class="flex flex-row items-center gap-3 pt-4 md:justify-between"
        aria-label="Table navigation"
    >
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400 block w-full md:inline md:w-auto">
        <span class="hidden md:inline-block">Mostrando</span>
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ showingFrom }}-{{ showingTo }}
        </span>
        de
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
      </span>

      <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
          <a
              href="#"
              @click.prevent="previousPage"
              class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            <ChevronLeft/>
          </a>
        </li>
        <li v-for="(page, index) in paginationRange" :key="index">
          <a
              href="#"
              @click.prevent="page !== '...' && changePage(page)"
              class="flex items-center justify-center px-3 h-8 leading-tight"
              :class="[
              page === '...'
                ? 'text-gray-500 dark:bg-gray-800 '
                : currentPage === page
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
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
            <ChevronRight/>
          </a>
        </li>
      </ul>
    </nav>
  </CardLayout>
</template>
