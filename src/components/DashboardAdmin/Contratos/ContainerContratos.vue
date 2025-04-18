<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { ref, computed, onMounted } from 'vue';
import { Search, Eye, ChevronLeft, ChevronRight, FileDown } from 'lucide-vue-next';
import Contrato from "@/components/DashboardAdmin/Contratos/Contrato.vue";
import { investmentService } from '@/services/investment_service';
import { userService } from '@/services/user_service';
import { logError } from '@/utils/logger';
import SecureLS from 'secure-ls';
import { auth } from '@/services/firebase_config';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { generarPdf } from '@/utils/pdf_contrato.js';

const formatearFecha = ts =>
    ts?.toDate?.().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) || 'Sin fecha';

const descargarContratoPDF = async (userId) => {
  try {
    toast.info('Generando contrato...', { timeout: 3000 });

    const [investment, user] = await Promise.all([
      investmentService.getInvestmentByUserId(userId),
      userService.getUserById(userId)
    ]);

    if (!investment || !user?.data) {
      toast.error('No se pudo generar el contrato. Datos incompletos');
      logError('Datos incompletos para generar el contrato');
      return;
    }

    const porcentajeMensual =
        investment.interestRate === 0.3 ? '6%' :
            investment.interestRate === 0.5 ? '10%' : '14%';
    const retiroPorcentual =
        investment.interestRate === 0.3 ? '12%, 24%, 36%, 48%, 60%, 72%, 84%, 96% y 4%' :
            investment.interestRate === 0.5 ? '10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% y 100%': '8%, 16%, 24%, 32%, 40%, 48%, 56%, 64%, 72%, 80%, 88%, 96% y 4%'

    // Generar PDF y descargar ✨
    const pdfDoc = await generarPdf({
      ciudad:            'Ciudad de Panamá',
      fecha:             formatearFecha(investment.activationDate),
      numeroContrato:    investment.numberinvestment || '---',
      empresa:           'DinnerMax',
      ruc:               '155763860-2-2025',
      cliente:           user.data.nombre   || '---',
      cedula:            user.data.cedula   || '---',
      cedulaAdmin:       '8-408-751',
      monto:             investment.investment ? `${investment.investment} USDT` : '---',
      paquete:           investment.planName || '---',
      porcentajeMensual,
      duracion:          investment.duration || '---',
      fechaInicio:       formatearFecha(investment.activationDate),
      fechaFin:          formatearFecha(investment.expirationDate),
      pais:              user.data.pais     || '---',
      email:             user.data.email    || '---',
      telefono:          user.data.telefono || '---',
      incrementales: retiroPorcentual
    });

    pdfDoc.download(`Contrato_${user.data.nombre || 'Cliente'}.pdf`);

    // Marcar contrato como descargado 🔖
    await investmentService.marcarContratoComoDescargado(investment.id);

    toast.success('Contrato descargado correctamente', { timeout: 3000 });
  } catch (error) {
    toast.error('Error al generar el contrato');
    logError('Error al generar contrato PDF:', error);
  }
};

const router = useRouter();
const toast = useToast();
const ls = new SecureLS({ encodingType: 'aes' });
const userRole = computed(() => ls.get('user_role') || '');

const isModalVisible = ref(false);
const selectedUser = ref(null);
const products = ref([]);

const colors = {
  pending: '#DAAA39',
  approved: '#03A66D',
  rejected: '#DC2626'
};

const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalItems = computed(() => filteredProducts.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

onMounted(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    logError('Usuario no autenticado');
    return;
  }

  investmentService.subscribeToInvestments(
      async (investments) => {
        try {
          const mappedInvestments = await Promise.all(investments.map(async (inv) => {
            const userData = await investmentService.getUserDataForInvestment(inv.userId);

            if (userRole.value === 'socio' && userData?.socioId !== currentUser.uid) {
              return null;
            }
            if (userRole.value === 'admin' && userData?.socioId) {
              return null;
            }

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
              voucherUrl: inv.voucherUrl,
              documentContract: inv.documentContract
            };
          }));

          products.value = mappedInvestments.filter(inv => inv !== null);
        } catch (error) {
          logError('Error al cargar las inversiones:', error);
        }
      }
  );
});

const verificarConfiguracion = async () => {
  try {
    const configData = await investmentService.getConfiguracion();

    // Si es socio y existe configuración, permitir continuar
    if (userRole.value === 'socio') {
      if (configData) {
        return true;
      } else {
        toast.info("Por favor, contacta al administrador para gestionar la configuración de porcentajes", {
          timeout: 5000
        });
        return false;
      }
    }

    // Verificaciones para el admin
    if (!configData) {
      toast.warning("No se encontró la configuración del sistema", {
        timeout: 4000
      });
      router.push('/admin/configurations/recompensas');
      return false;
    }

    const requiredFields = ['minimumWithdrawal', 'referral', 'withdrawal'];
    const missingFields = requiredFields.filter(field =>
        typeof configData[field] !== 'number' || configData[field] < 0
    );

    if (missingFields.length > 0) {
      toast.warning(`Por favor, complete la configuración de: ${missingFields.join(', ')}`, {
        timeout: 4000
      });
      router.push('/admin/configurations/recompensas');
      return false;
    }

    return true;
  } catch (error) {
    logError('Error al verificar la configuración:', error);
    toast.error("Error al verificar la configuración");
    return false;
  }
};

const openModal = async (user) => {
  const configuracionCompleta = await verificarConfiguracion();
  if (configuracionCompleta) {
    selectedUser.value = user;
    isModalVisible.value = true;
  }
};

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

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

const showingFrom = computed(() => ((currentPage.value - 1) * itemsPerPage.value) + 1);
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value));

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
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Contrato</th>
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
            <div class="flex justify-center">
              <button
                  :disabled="product.estado !== 'approved'"
                  @click="descargarContratoPDF(product.userId)"
                  class="flex items-center py-1 px-2 rounded-[8px] gap-2 border transition-all duration-300"
                  :class="{
                    'bg-red-200 text-red-700 border-red-700': product.documentContract === 'notdownloaded' && product.estado === 'approved',
                    'bg-green-200 text-green-700 border-green-700': product.documentContract === 'downloaded' && product.estado === 'approved',
                    'bg-gray-300 text-gray-500  border-yellow-500 cursor-not-allowed': product.estado !== 'approved'
                  }"
                  >
                <FileDown />
                <span>
                {{
                            product.estado !== 'approved'
                                ? 'No disponible'
                                : product.documentContract === 'downloaded'
                                    ? 'Descargado'
                                    : 'Descargar'
                          }}
                </span>
              </button>
            </div>
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
:global(.Vue-Toastification__toast) {
  width: 420px !important;
}
</style>