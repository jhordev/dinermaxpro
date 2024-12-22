// TableMovimientos.vue
<script setup>
import { ref, computed } from 'vue';
import { Search, ChevronDown, Sheet, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Props
const props = defineProps({
  datos: {
    type: Array,
    required: true,
  },
});

// Dropdown state
const dropdownOpen = ref(false);
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalItems = computed(() => props.datos.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Computed
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return props.datos.slice(start, end);
});

const showingFrom = computed(() => ((currentPage.value - 1) * itemsPerPage.value) + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

// Methods
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

// Pagination range logic
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
</script>

<template>
  <div class="rounded-[15px] bg-bgCardLigth p-5 md:p-6 shadow-default dark:bg-bgDashboardDark w-full ">
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Información de Referidos
    </h2>
    <!-- Search bar -->
    <header class="mt-5 flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
      <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
        <Search class="text-gray-500" />
        <input type="text" class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white" placeholder="Buscar...">
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

    <!-- Table -->
    <div class="overflow-x-auto mt-5">
      <table class="w-full table-auto border-collapse text-left">
        <thead>
        <tr class="bg-transparent">
          <th class="p-4 text-sm font-medium uppercase text-black dark:text-white">Nombre</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Plan Contratado</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Fecha de Registro</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Ganancias</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(product, index) in paginatedProducts" :key="index" :class="index % 2 === 0 ? 'bg-transparent' : 'bg-bgf3 dark:bg-colorfila'">
          <td class="p-4 text-[14px] font-normal text-colorTextBlack dark:text-white">{{ product.nombre }}</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">{{ product.planContratado }}</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">{{ product.fechaRegistro }}</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">${{ product.ganancias }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav class="flex flex-row items-center gap-3 pt-4 md:justify-between" aria-label="Table navigation">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400 block w-full md:inline md:w-auto">
        <span class="hidden md:inline-block">Mostrando</span> <span class="font-semibold text-gray-900 dark:text-white">{{ showingFrom }}-{{ showingTo }}</span> de
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
      </span>

      <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
          <a href="#" @click.prevent="previousPage" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
            <ChevronLeft />
          </a>
        </li>
        <li v-for="(page, index) in paginationRange" :key="index">
          <a href="#" @click.prevent="page !== '...' && changePage(page)" class="flex items-center justify-center px-3 h-8 leading-tight " :class="[page === '...' ? 'text-gray-500 dark:bg-gray-800 ' : (currentPage === page ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white')]">
            {{ page }}
          </a>
        </li>
        <li>
          <a href="#" @click.prevent="nextPage" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
            <ChevronRight />
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
/* Agregar estilos si es necesario */
</style>
