<script setup>
import { ref, computed } from "vue";
import UserPersonalInfoCard from "@/components/DashboardAdmin/User/UserPersonalInfoCard.vue";
import ActiveMembershipCard from "@/components/DashboardAdmin/User/ActiveMembershipCard.vue";
import WalletHistoryCard from "@/components/DashboardAdmin/User/WalletHistoryCard.vue";
import { FileDown, Star, CircleUserRound, Loader2 } from 'lucide-vue-next';
import { logDebug, logInfo, logError } from '@/utils/logger.js';
import { generarPdf } from '@/utils/pdf_generator';
import { updateUserStatus } from '@/services/users_list_service';

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      nombre: '',
      hasActivePlan: false,
      estado: 'activo'
    })
  }
});

const userName = computed(() => {
  logDebug('Nombre de usuario obtenido:', props.user.nombre);
  return props.user.nombre;
});

const userId = computed(() => {
  logDebug('ID de usuario obtenido:', props.user.id);
  return props.user.id;
});

const emit = defineEmits(['update-status']);
const isGeneratingPDF = ref(false);
const historialRef = ref(null);
const isUpdatingStatus = ref(false);

const handleStatusChange = async (event) => {
  try {
    isUpdatingStatus.value = true;
    const newStatus = event.target.checked;

    const result = await updateUserStatus(userId.value, newStatus);

    if (result.success) {
      emit('update-status', {
        userId: userId.value,
        estado: newStatus ? 'activo' : 'inactivo'
      });
      logInfo(`Estado del usuario actualizado exitosamente a: ${newStatus ? 'activo' : 'inactivo'}`);
    } else {
      event.target.checked = !newStatus;
      logError('Error al actualizar estado:', result.error);
    }
  } catch (error) {
    logError('Error en la actualización del estado:', error);
    event.target.checked = !event.target.checked;
  } finally {
    isUpdatingStatus.value = false;
  }
};

const handleGeneratePDF = async () => {
  try {
    isGeneratingPDF.value = true;
    logInfo('Iniciando generación de PDF...');

    const transactions = historialRef.value?.transactions || [];
    const filasPDF = transactions.map(transaction => [
      transaction.fecha,
      transaction.transaccion,
      transaction.operacion,
      transaction.network || '-', // Agregamos guion si no hay red
      historialRef.value.formatCurrency(transaction.monto),
      transaction.operacion === 'Depósito' ?
          (transaction.status === 'approved' ? 'Aprobado' :
              transaction.status === 'pending' ? 'Pendiente' : 'Rechazado') :
          (transaction.status === 'completed' ? 'Completado' : 'Pendiente')
    ]);

    const opcionesPDF = {
      nombreCompleto: props.user.nombre,
      pais: props.user.pais || 'No especificado',
      telefono: props.user.telefono || 'No especificado',
      email: props.user.email || 'No especificado',
      columnas: ['Fecha', 'Transacción', 'Operación', 'Red', 'Monto', 'Estado'],
      filas: filasPDF
    };

    const doc = generarPdf(opcionesPDF);
    doc.save(`reporte_${props.user.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    logInfo('PDF generado exitosamente');
  } catch (error) {
    logError('Error al generar PDF:', error);
  } finally {
    isGeneratingPDF.value = false;
  }
};
</script>

<template>
  <section>
    <header class="flex flex-row justify-between items-center pb-5">
      <div class="flex items-center gap-2.5 text-colorTextBlack dark:text-white">
        <CircleUserRound class="w-8 h-8" />
        <span class="hidden lg:block text-[20px] font-medium">
          {{ userName }}
        </span>
      </div>

      <div class="inline-flex rounded-md shadow-sm">
        <button
            @click="handleGeneratePDF"
            :disabled="isGeneratingPDF"
            class="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="flex items-center">
            <Loader2 v-if="isGeneratingPDF" class="w-4 h-4 animate-spin" />
            <FileDown v-else class="w-6 h-6" />
          </div>
        </button>
        <div
            class="flex px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          <label class="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                :checked="user.estado === 'activo'"
                @change="handleStatusChange"
                :disabled="isUpdatingStatus"
                class="sr-only peer"
            >
            <div class="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </header>
    <main class="grid grid-cols-8 mt-5 gap-5">
      <UserPersonalInfoCard
          :user-id="userId"
          :user-data="user"
          class="col-span-8 lg:col-span-4"
      />
      <ActiveMembershipCard
          :user-id="userId"
          class="col-span-8 lg:col-span-4"
      />
      <WalletHistoryCard
          ref="historialRef"
          :user-id="userId"
          class="col-span-8"
      />
    </main>
  </section>
</template>

<style scoped></style>