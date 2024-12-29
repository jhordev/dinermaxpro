<script setup>
import { Loader2, Plus, UserPen, Search, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { ref, computed } from 'vue';
import CardLayout from '@/layouts/CardLayout.vue';
import ContainerAsistens from "@/dialogs/AsistentesDialog.vue";

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
const asistentes = ref([
  { email: 'juan.perez@example.com', nombre: 'Juan Pérez', pais: 'México', registro: '2022-12-31', password: 'pass1234', estado: 'Activo' },
  { email: 'luis.rodriguez@example.com', nombre: 'Luis Rodríguez', pais: 'Argentina', registro: '2023-01-02', password: 'mypassword', estado: 'Activo' },
  { email: 'maria.lopez@example.com', nombre: 'María López', pais: 'Colombia', registro: '2023-01-03', password: 'qwerty789', estado: 'Inactivo' },
  { email: 'carlos.sanchez@example.com', nombre: 'Carlos Sánchez', pais: 'Chile', registro: '2023-01-04', password: 'abc12345', estado: 'Activo' },
  { email: 'laura.garcia@example.com', nombre: 'Laura García', pais: 'Perú', registro: '2023-01-05', password: 'password456', estado: 'Activo' },
  { email: 'paula.martinez@example.com', nombre: 'Paula Martínez', pais: 'Bolivia', registro: '2023-01-07', password: 'paula1234', estado: 'Activo' },
  { email: 'felipe.ramirez@example.com', nombre: 'Felipe Ramírez', pais: 'Paraguay', registro: '2023-01-08', password: 'felipepass', estado: 'Inactivo' },
  { email: 'sofia.diaz@example.com', nombre: 'Sofía Díaz', pais: 'Costa Rica', registro: '2023-01-09', password: 'sofiapass', estado: 'Activo' },
  { email: 'martin.morales@example.com', nombre: 'Martín Morales', pais: 'Ecuador', registro: '2023-01-10', password: 'martin123', estado: 'Inactivo' }
]);

// Modal
// Estado y datos del modal
const isModalOpen = ref(false);
const modalMode = ref("add");
const selectedAssistant = ref(null);

// Abrir el modal para agregar o actualizar
const openAddModal = () => {
  modalMode.value = "add";
  selectedAssistant.value = null;
  isModalOpen.value = true;
};

const openEditModal = (assistant) => {
  modalMode.value = "update";
  selectedAssistant.value = assistant;
  isModalOpen.value = true;
};

// Método para manejar la respuesta del modal
const handleModalClose = () => {
  isModalOpen.value = false;
};

// Filtro de búsqueda
const filteredasistentes = computed(() => {
  return asistentes.value.filter((transaction) => {
    const search = searchTerm.value.toLowerCase();
    return (
        transaction.email.toLowerCase().includes(search) ||
        transaction.nombre.toLowerCase().includes(search) ||
        transaction.pais.toLowerCase().includes(search) ||
        transaction.estado.toLowerCase().includes(search)
    );
  });
});

// Cálculos relacionados con la paginación
const totalItems = computed(() => filteredasistentes.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const paginatedasistentes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredasistentes.value.slice(start, end);
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
  <section>
    <header class="flex justify-between items-center">
      <h2 class="text-[28px] text-colorTextBlack dark:text-white font-bold">Asistentes</h2>
      <button
          type="button"
          @click="openAddModal"
          class="gap-2.5 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-500"
      >
        <Plus />
        <span class="hidden lg:block">Agregar Asistente</span>
      </button>
    </header>
    <main class="mt-[30px]">
      <CardLayout>
        <header class="flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
          <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
            <Search class="text-gray-500" />
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
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack dark:text-white">Email</th>
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center dark:text-white">Nombre</th>
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center dark:text-white">Pais</th>
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack text-center dark:text-white">Registro</th>
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack dark:text-white text-center">Password</th>
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack dark:text-white text-center">Estado</th>
              <th class="p-4 text-sm font-medium uppercase text-colorTextBlack dark:text-white text-center">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(transaction, index) in paginatedasistentes"
                :key="index"
                :class="index % 2 === 0 ? 'bg-transparent' : 'bg-bgf3 dark:bg-colorfila'"
            >
              <td class="p-4 text-[14px] font-normal text-colorTextBlack dark:text-white">
                {{ transaction.email }}
              </td>
              <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
                {{ transaction.nombre }}
              </td>
              <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
                {{ transaction.pais }}
              </td>
              <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
                {{ transaction.registro }}
              </td>
              <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
                {{ transaction.password }}
              </td>
              <td class="p-4 text-[14px] text-center font-normal text-colorTextBlack dark:text-white">
                  <span
                      class="p-1 flex justify-center font-bold rounded-[5px]"
                      :class="{
                      'bg-[#03A66D]': transaction.estado === 'Activo',
                      'bg-[#DC2626]': transaction.estado === 'Inactivo',
                    }"
                  >
                    {{ transaction.estado }}
                  </span>
              </td>
              <td class="p-4 text-[14px] flex justify-center font-normal text-center text-colorTextBlack dark:text-white">
                <div class="flex items-center gap-3">
                  <label class="inline-flex items-center   cursor-pointer">
                    <input type="checkbox" value="" class="sr-only peer">
                    <div class="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                  <button
                      @click="openEditModal(transaction)"
                      class=""
                      title="Editar"
                  >
                    <UserPen />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <ContainerAsistens
            :modelValue="isModalOpen"
            :mode="modalMode"
            :assistant="selectedAssistant"
            @update:modelValue="handleModalClose"
            @assistant-added="asistentes.value.push($event)"
            @assistant-updated="handleModalClose"
        />

        <!-- Paginación -->
        <nav
            class="flex flex-row items-center gap-3 pt-4 md:justify-between"
            aria-label="Table navigation"
        >
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400 block w-full md:inline md:w-auto">
            Mostrando
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
                <ChevronLeft />
              </a>
            </li>
            <li v-for="(page, index) in paginationRange" :key="index">
              <a
                  href="#"
                  @click.prevent="page !== '...' && changePage(page)"
                  class="flex items-center justify-center px-3 h-8 leading-tight"
                  :class="[
                  page === '...'
                    ? 'text-gray-500 dark:bg-gray-800'
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
                <ChevronRight />
              </a>
            </li>
          </ul>
        </nav>
      </CardLayout>
    </main>
  </section>
</template>

<style scoped>
</style>
