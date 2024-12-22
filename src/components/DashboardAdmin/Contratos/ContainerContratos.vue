<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import {ref, computed} from 'vue';
import {Search, Eye, ChevronDown, Sheet, FileText, ChevronLeft, ChevronRight} from 'lucide-vue-next';
import Contrato from "@/components/DashboardAdmin/Contratos/Contrato.vue";

import imgProfile from '@/assets/img/capture.jpg'



// Controlar la visibilidad del modal
const isModalVisible = ref(false);
const selectedUser = ref(null); // Almacena los datos del usuario seleccionado

// Función para abrir el modal
const openModal = (user) => {
  selectedUser.value = user;
  isModalVisible.value = true;
};

// Data
const products = ref([
  {
    usuario: "Juan Pérez",
    plan: "Básico",
    capital: 1000,
    registro: "2024-12-01",
    caducidad: "2025-12-01",
    estado: "Pendiente"
  },
  {
    usuario: "María López",
    plan: "Premium",
    capital: 5000,
    registro: "2024-11-15",
    caducidad: "2025-11-15",
    estado: "Aprobado"
  },
  {
    usuario: "Carlos García",
    plan: "Estándar",
    capital: 2000,
    registro: "2024-12-05",
    caducidad: "2025-12-05",
    estado: "No aprobado"
  },
  {
    usuario: "Ana Torres",
    plan: "Básico",
    capital: 1500,
    registro: "2024-12-10",
    caducidad: "2025-12-10",
    estado: "Pendiente"
  },
  {
    usuario: "Luis Martínez",
    plan: "Premium",
    capital: 8000,
    registro: "2024-11-20",
    caducidad: "2025-11-20",
    estado: "Aprobado"
  },
  {
    usuario: "Sofía Gómez",
    plan: "Estándar",
    capital: 3000,
    registro: "2024-12-08",
    caducidad: "2025-12-08",
    estado: "Pendiente"
  },
  {
    usuario: "Miguel Ramírez",
    plan: "Básico",
    capital: 1200,
    registro: "2024-11-30",
    caducidad: "2025-11-30",
    estado: "No aprobado"
  },
  {
    usuario: "Laura Sánchez",
    plan: "Premium",
    capital: 10000,
    registro: "2024-11-01",
    caducidad: "2025-11-01",
    estado: "Aprobado"
  },
  {
    usuario: "David Castillo",
    plan: "Estándar",
    capital: 2500,
    registro: "2024-12-12",
    caducidad: "2025-12-12",
    estado: "Pendiente"
  },
  {
    usuario: "Carmen Ruiz",
    plan: "Básico",
    capital: 800,
    registro: "2024-12-14",
    caducidad: "2025-12-14",
    estado: "No aprobado"
  }
]);

// Colors for status
const colors = {
  Pendiente: '#DAAA39',
  Aprobado: '#03A66D',
  'No aprobado': '#DC2626'
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalItems = computed(() => products.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Computed
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return products.value.slice(start, end);
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

  // Start page
  let startPage = currentPage.value - 1;
  // End page
  let endPage = currentPage.value + 1;

  // Ensure range is within the page limits
  if (startPage < 1) startPage = 1;
  if (endPage > maxPages) endPage = maxPages;

  // Add pages to range
  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }

  // Add dots if needed
  if (startPage > 2) range.unshift('...');
  if (endPage < maxPages - 1) range.push('...');

  return range;
});
</script>

<template>
  <CardLayout>
    <header class="flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
      <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
        <Search class="text-gray-500"/>
        <input type="text"
               class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white"
               placeholder="Buscar...">
      </div>
    </header>

    <!-- Table -->
    <div class="overflow-x-auto mt-5">
      <table class="w-full table-auto border-collapse text-left">
        <thead>
        <tr class="bg-transparent">
          <th class="p-4 text-sm font-medium uppercase text-black dark:text-white">Usuario</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Plan</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Capital</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Registro</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Caducidad</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Estado</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Ver</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(product, index) in paginatedProducts"
            :key="index"
            :class="index % 2 === 0 ? 'bg-transparent' : 'bg-bgf3 dark:bg-colorfila'">
          <td class="p-4 text-[14px] font-normal text-colorTextBlack dark:text-white">{{ product.usuario }}</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">{{
              product.plan
            }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">$ {{
              product.capital
            }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">{{
              product.registro
            }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">{{
              product.caducidad
            }}
          </td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">
            <div :style="{ backgroundColor: colors[product.estado] }"
                 class="px-1 py-1 text-[12px] rounded-[5px] font-bold text-white text-center">
              {{ product.estado }}
            </div>
          </td>
          <td class="text-colorTextBlack dark:text-white text-center">
            <button @click="openModal(product)" class="cursor-pointer">
              <Eye/>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Contrato v-model="isModalVisible" :name="selectedUser?.usuario" :monto="selectedUser?.capital"
              :wallet="selectedUser?.plan" :image="imgProfile" />

    <!-- Pagination -->
    <nav class="flex flex-row items-center gap-3 pt-4 md:justify-between" aria-label="Table navigation">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400 block w-full md:inline md:w-auto">
        <span class="hidden md:inline-block">Mostrando</span> <span class="font-semibold text-gray-900 dark:text-white">{{
          showingFrom
        }}-{{ showingTo }}</span> de
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
      </span>

      <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
          <a href="#" @click.prevent="previousPage"
             class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
             :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
            <ChevronLeft/>
          </a>
        </li>
        <li v-for="(page, index) in paginationRange" :key="index">
          <a href="#" @click.prevent="page !== '...' && changePage(page)"
             class="flex items-center justify-center px-3 h-8 leading-tight "
             :class="[page === '...' ? 'text-gray-500 dark:bg-gray-800 ' : (currentPage === page ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white')]">
            {{ page }}
          </a>
        </li>
        <li>
          <a href="#" @click.prevent="nextPage"
             class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
             :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
            <ChevronRight/>
          </a>
        </li>
      </ul>
    </nav>
  </CardLayout>
</template>
