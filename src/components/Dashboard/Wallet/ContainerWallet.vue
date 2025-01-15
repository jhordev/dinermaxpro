<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import FormRetirar from "@/components/Dashboard/Wallet/FormRetirar.vue";
import TableMovimientos from "@/components/Dashboard/Wallet/TableMovimientos.vue";
import { investmentService } from '@/services/investment_service';
import { subscribeToUserWithdrawals } from '@/services/withdrawal_service';
import { auth } from '@/services/firebase_config';
import { logError, logInfo } from '@/utils/logger';
import { generarPdf } from '@/utils/pdf_generator';

const movimientos = ref([]);
const isLoading = ref(true);
const isGeneratingPDF = ref(false);
const tableRef = ref(null);
let unsubscribeInvestments = null;
let unsubscribeWithdrawals = null;

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
};

const handleGeneratePDF = async () => {
  try {
    isGeneratingPDF.value = true;
    const transactions = tableRef.value?.transactions || [];
    const filasPDF = transactions.map(t => [
      t.fecha,
      t.transaccion,
      t.operacion,
      t.network || '-',
      tableRef.value.formatCurrency(t.monto),
      t.operacion === 'Depósito'
          ? (t.status === 'approved' ? 'Aprobado' : t.status === 'pending' ? 'Pendiente' : 'Rechazado')
          : (t.status === 'completed' ? 'Completado' : 'Pendiente')
    ]);

    const doc = generarPdf({
      nombreCompleto: auth.currentUser?.displayName || 'Usuario',
      pais: 'No especificado',
      telefono: 'No especificado',
      email: auth.currentUser?.email || '',
      columnas: ['Fecha', 'Transacción', 'Operación', 'Red', 'Monto', 'Estado'],
      filas: filasPDF
    });

    doc.save(`reporte_movimientos_${new Date().toISOString().split('T')[0]}.pdf`);
    logInfo('PDF generado exitosamente');
  } catch (error) {
    logError('Error al generar PDF:', error);
  } finally {
    isGeneratingPDF.value = false;
  }
};

const mapMovement = (item, type) => ({
  fecha: formatDate(item.createdAt),
  transaccion: item.id.slice(0, 8).toUpperCase(),
  operacion: type,
  monto: type === 'Depósito' ? item.investment : item.netAmount,
  status: item.status,
  network: item.network || '',
  paymentMethod: type === 'Depósito' ? item.paymentMethod : 'Wallet',
  voucherUrl: type === 'Depósito' ? item.voucherUrl : '',
  comision: type === 'Retiro' ? item.withdrawalFee : undefined,
  billetera: type === 'Retiro' ? item.walletAddress : undefined,
  timestamp: item.createdAt
});

onMounted(async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    unsubscribeInvestments = investmentService.subscribeToInvestments((investments) => {
      const depositMovements = investments
          .filter(inv => inv.userId === userId)
          .map(inv => mapMovement(inv, 'Depósito'));

      movimientos.value = [...movimientos.value.filter(m => m.operacion === 'Retiro'), ...depositMovements];
      ordenarMovimientos();
      isLoading.value = false;
    });

    unsubscribeWithdrawals = subscribeToUserWithdrawals((withdrawals) => {
      const withdrawalMovements = withdrawals
          .filter(w => w.userId === userId)
          .map(w => mapMovement(w, 'Retiro'));

      movimientos.value = [...movimientos.value.filter(m => m.operacion === 'Depósito'), ...withdrawalMovements];
      ordenarMovimientos();
      isLoading.value = false;
    });
  } catch (error) {
    logError('Error al cargar los movimientos:', error);
    isLoading.value = false;
  }
});

const ordenarMovimientos = () => {
  try {
    movimientos.value.sort((a, b) => {
      const getDate = (timestamp) => {
        if (!timestamp) return new Date(0);
        return timestamp instanceof Date ? timestamp :
            typeof timestamp.toDate === 'function' ? timestamp.toDate() :
                new Date(timestamp);
      };
      return getDate(b.timestamp) - getDate(a.timestamp);
    });
  } catch (error) {
    logError('Error al ordenar movimientos:', error);
  }
};

onUnmounted(() => {
  if (unsubscribeInvestments) unsubscribeInvestments();
  if (unsubscribeWithdrawals) unsubscribeWithdrawals();
});
</script>

<template>
  <section class="flex flex-col md:flex-row gap-[24px]">
    <FormRetirar class="flex-[0.4] h-fit" />
    <TableMovimientos
        ref="tableRef"
        :datos="movimientos"
        :isLoading="isLoading"
        :isGeneratingPDF="isGeneratingPDF"
        @generate-pdf="handleGeneratePDF"
        class="flex-1"
    />
  </section>
</template>

<style scoped>

</style>
