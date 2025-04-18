<script setup>
import { Loader2, Plus, UserPen, Search, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { ref, computed, onMounted, onUnmounted } from 'vue';
import CardLayout from '@/layouts/CardLayout.vue';
import { logError, logInfo } from "@/utils/logger.js";
import { subscribeToSocios, updateSocioStatus } from '@/services/socio_service';
import AsistentesDialog from "@/dialogs/AsistentesDialog.vue";
import InfoSocioModal from "@/components/DashboardAdmin/Asistentes/InfoSocioModal.vue";
import {
  subscribeToSocioInvestments,
  subscribeToSocioUsersList,
  subscribeToSocioWithdrawals,
  subscribeToSocioMembershipsStatus,
  subscribeToSocioReferrals
} from "@/services/socio_users_service.js";

const isModalVisible = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const searchTerm = ref('');
const dropdownOpen = ref(false);
const asistentes = ref([]);
const loading = ref(true);
const selectedSocioId = ref(null);
const selectedSocio = ref(null);
const isModalOpen = ref(false);
const modalMode = ref("add");
const selectedAssistant = ref(null);

const socioData = ref({
  totalUsuarios: 0,
  fondos: 0,
  retirados: 0,
  usuariosSinPlan: 0
});

const membershipData = ref({
  active: 0,
  inactive: 0
});

const subscriptionPlans = ref([
  { name: 'Plan Básico', count: 0 },
  { name: 'Plan Estándar', count: 0 },
  { name: 'Plan Pro', count: 0 }
]);

const referralData = ref({
  referred: 0,
  earnings: 0
});

let unsubscribe = null;
let unsubscribeUsers = null;
let unsubscribeWithdrawals = null;
let unsubscribeInvestments = null;
let unsubscribeMemberships = null;
let unsubscribeReferrals = null;

const loadSocioData = async (socioId) => {
  try {
    [unsubscribeUsers, unsubscribeWithdrawals, unsubscribeInvestments, unsubscribeMemberships, unsubscribeReferrals]
        .forEach(unsub => unsub?.());

    unsubscribeUsers = await subscribeToSocioUsersList((users) => {
      socioData.value.totalUsuarios = users.length;
      // Calcular usuarios sin plan activo
      socioData.value.usuariosSinPlan = users.filter(user => !user.hasActivePlan).length;
    }, socioId);

    unsubscribeMemberships = await subscribeToSocioMembershipsStatus((stats) => {
      membershipData.value = stats.membershipStatus;
      subscriptionPlans.value = [
        { name: 'Plan Básico', count: stats.planCounts.basico },
        { name: 'Plan Estándar', count: stats.planCounts.estandar },
        { name: 'Plan Pro', count: stats.planCounts.pro }
      ];
    }, socioId);

    unsubscribeInvestments = await subscribeToSocioInvestments((total) => {
      socioData.value.fondos = total;
    }, socioId);

    unsubscribeWithdrawals = await subscribeToSocioWithdrawals((withdrawals) => {
      socioData.value.retirados = withdrawals.reduce((total, w) =>
          w.status === 'completed' ? total + Number(w.amount || 0) : total, 0);
    }, socioId);

    unsubscribeReferrals = await subscribeToSocioReferrals((data) => {
      referralData.value = data;
    }, socioId);

  } catch (error) {
    logError('Error al cargar datos del socio:', error);
  }
};

const handleRowClick = (event, socio) => {
  if (!event.target.closest('td:last-child')) {
    selectedSocio.value = socio;
    selectedSocioId.value = socio.id;
    loadSocioData(socio.id);
    isModalVisible.value = true;
  }
};

const closeModal = () => {
  isModalVisible.value = false;
  [unsubscribeUsers, unsubscribeWithdrawals, unsubscribeInvestments, unsubscribeMemberships, unsubscribeReferrals]
      .forEach(unsub => unsub?.());
};

onMounted(() => {
  unsubscribe = subscribeToSocios((socios) => {
    asistentes.value = socios;
    loading.value = false;
  });
});

onUnmounted(() => {
  [unsubscribe, unsubscribeUsers, unsubscribeWithdrawals, unsubscribeInvestments, unsubscribeMemberships, unsubscribeReferrals]
      .forEach(unsub => unsub?.());
});

const filteredasistentes = computed(() => {
  const search = searchTerm.value.toLowerCase();
  return asistentes.value.filter(t =>
      t.email?.toLowerCase().includes(search) ||
      t.nombre?.toLowerCase().includes(search) ||
      t.pais?.toLowerCase().includes(search) ||
      t.estado?.toLowerCase().includes(search)
  );
});

const totalItems = computed(() => filteredasistentes.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const paginatedasistentes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredasistentes.value.slice(start, start + itemsPerPage.value);
});

const paginationRange = computed(() => {
  const range = [];
  const maxPages = totalPages.value;
  let [start, end] = [Math.max(1, currentPage.value - 1), Math.min(maxPages, currentPage.value + 1)];

  if (start > 2) range.push('...');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < maxPages - 1) range.push('...');

  return range;
});

const showingFrom = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

const handleStatusChange = async (socio) => {
  try {
    const newStatus = socio.estado === 'activo' ? 'inactivo' : 'activo';
    await updateSocioStatus(socio.id, newStatus);
  } catch (error) {
    logError('Error al actualizar estado:', error);
  }
};

const changePage = page => page >= 1 && page <= totalPages.value && (currentPage.value = page);
const previousPage = () => currentPage.value > 1 && currentPage.value--;
const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
const toggleDropdown = () => dropdownOpen.value = !dropdownOpen.value;
const openAddModal = () => {
  modalMode.value = "add";
  selectedAssistant.value = null;
  isModalOpen.value = true;
};
const openEditModal = assistant => {
  modalMode.value = "update";
  selectedAssistant.value = assistant;
  isModalOpen.value = true;
};
const handleAssistantAdded = () => isModalOpen.value = false;
const handleAssistantUpdated = () => isModalOpen.value = false;
const handleModalClose = () => isModalOpen.value = false;
</script>

<template>
  <section>
    <header class="flex justify-between items-center">
      <h2 class="text-[28px] text-colorTextBlack dark:text-white font-bold">Lista de Socios</h2>
      <button
          type="button"
          @click="openAddModal"
          class="gap-2.5 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-500"
      >
        <Plus />
        <span class="hidden lg:block">Agregar Socio</span>
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

        <div class="overflow-x-auto mt-5">
          <div v-if="loading" class="flex justify-center items-center py-8">
            <Loader2 class="animate-spin" />
          </div>

          <table v-else class="w-full table-auto border-collapse text-left">
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
            <tr v-if="paginatedasistentes.length === 0">
              <td colspan="7" class="text-center p-4 text-colorTextBlack dark:text-white">
                No se encontraron socios
              </td>
            </tr>
            <tr
                v-for="(transaction, index) in paginatedasistentes"
                :key="transaction.id"
                @click="(event) => handleRowClick(event, transaction)"
                class="bg-transparent hover:bg-bgf3 hover:dark:bg-colorfila"
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
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        :checked="transaction.estado === 'Activo'"
                        @change="handleStatusChange(transaction)"
                        class="sr-only peer"
                    >
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

        <AsistentesDialog
            v-if="isModalOpen"
            v-model="isModalOpen"
            :mode="modalMode"
            :assistant="selectedAssistant"
            @assistant-added="handleAssistantAdded"
            @assistant-updated="handleAssistantUpdated"
            @close="handleModalClose"
        />

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
    <InfoSocioModal
        :show="isModalVisible"
        :socioData="socioData"
        :membershipData="membershipData"
        :subscriptionPlans="subscriptionPlans"
        :referralData="referralData"
        :socioNombre="selectedSocio?.nombre || 'Sin nombre'"
        @close="closeModal"
    />
  </section>
</template>

<style scoped>
</style>