<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { ref, computed, onMounted } from 'vue';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import Contrato from "@/components/DashboardAdmin/Contratos/Contrato.vue";
import { investmentService } from '@/services/investment_service';
import imgProfile from '@/assets/img/capture.jpg';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase_config';

const isModalVisible = ref(false);
const selectedUser = ref(null);
const products = ref([]);

// Estados según Firestore
const colors = {
  pending: '#DAAA39',
  approved: '#03A66D',
  rejected: '#DC2626'
};

const searchTerm = ref('');

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalItems = computed(() => filteredProducts.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

onMounted(() => {
  investmentService.subscribeToInvestments(async (investments) => {
    const mappedInvestments = await Promise.all(investments.map(async (inv) => {
      const userRef = doc(db, 'users', inv.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      // Calcular la fecha de caducidad solo si está aprobado
      let caducidad = 'Pendiente';
      if (inv.status === 'approved' && inv.expirationDate) {
        caducidad = inv.expirationDate.toDate().toLocaleDateString();
      }

      return {
        id: inv.id,
        userId: inv.userId,
        usuario: userData?.nombre || 'Usuario no encontrado',
        plan: inv.planName,
        capital: inv.investment,
        registro: inv.createdAt.toDate().toLocaleDateString(),
        caducidad: caducidad,
        estado: inv.status,
        walletAddress: inv.walletAddress,
        voucherUrl: inv.voucherUrl
      };
    }));

    products.value = mappedInvestments;
  });
});

// Funciones del modal
const openModal = (user) => {
  selectedUser.value = user;
  isModalVisible.value = true;
};

// Filtrado de productos
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const searchLower = searchTerm.value.toLowerCase();
    return (
        product.usuario.toLowerCase().includes(searchLower) ||
        product.plan.toLowerCase().includes(searchLower) ||
        product.estado.toLowerCase().includes(searchLower)
    );
  });
});

// Computed para paginación
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

const showingFrom = computed(() => ((currentPage.value - 1) * itemsPerPage.value) + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

// Métodos de paginación
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

// Lógica del rango de paginación
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
  <CardLayout>
    <header class="flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
      <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
        <Search class="text-gray-500"/>
        <input type="text"
               v-model="searchTerm"
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
    <Contrato
        v-if="selectedUser"
        v-model="isModalVisible"
        :name="selectedUser.usuario"
        :monto="selectedUser.capital"
        :wallet-address="selectedUser.walletAddress"
        :image="selectedUser.voucherUrl || imgProfile"
        :investment-id="selectedUser.id"
        :status="selectedUser.estado"
    />

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

<style scoped>
</style>