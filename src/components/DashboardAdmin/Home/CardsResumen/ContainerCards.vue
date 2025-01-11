<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import Card from "@/components/DashboardAdmin/Home/CardsResumen/Card.vue";
import iconUsers from '@/assets/img/icons/admin/resumen/users.svg'
import iconFunds from '@/assets/img/icons/admin/resumen/fondos.svg'
import iconFundsMenus from '@/assets/img/icons/admin/resumen/fondosres.svg'
import graficDash from '@/assets/img/icons/admin/resumen/graf.svg'
import { subscribeToUsersList, subscribeToTotalInvestments } from '@/services/users_list_service';
import { subscribeToUserWithdrawals } from '@/services/withdrawal_service';
import { logError, logInfo } from '@/utils/logger';

const props = defineProps({
  showAllData: {
    type: Boolean,
    default: false
  }
});

const totalUsuarios = ref(0);
const fondos = ref(0);
const retirados = ref(0);
let unsubscribeUsers = null;
let unsubscribeWithdrawals = null;
let unsubscribeInvestments = null;

const totalFondos = computed(() => {
  return Number((fondos.value - retirados.value).toFixed(2));
});

const cardsData = computed(() => [
  {
    title: "Total de Usuarios",
    value: totalUsuarios.value,
    percentage: 8.5,
    icon: iconUsers,
  },
  {
    title: "Fondos",
    value: fondos.value,
    percentage: 8.5,
    icon: iconFunds,
  },
  {
    title: "Fondos retirados",
    value: retirados.value,
    percentage: 8.5,
    icon: iconFundsMenus,
  },
  {
    title: "Total Fondos",
    value: totalFondos.value,
    percentage: -8.5,
    icon: graficDash,
  },
]);

const setupSubscriptions = async () => {
  try {
    if (unsubscribeUsers) unsubscribeUsers();
    if (unsubscribeWithdrawals) unsubscribeWithdrawals();
    if (unsubscribeInvestments) unsubscribeInvestments();

    // Suscribirse a la lista de usuarios
    unsubscribeUsers = await subscribeToUsersList((users) => {
      // Solo restamos 1 cuando showAllData es true
      totalUsuarios.value = props.showAllData ?
          (users.length > 0 ? users.length - 1 : 0) :
          users.length;
      logInfo('Total usuarios actualizados:', totalUsuarios.value);
    }, props.showAllData);

    // Suscribirse a las inversiones totales
    unsubscribeInvestments = await subscribeToTotalInvestments((total) => {
      fondos.value = total;
      logInfo('Total fondos actualizados:', fondos.value);
    }, props.showAllData);

    // Suscribirse a los retiros
    unsubscribeWithdrawals = subscribeToUserWithdrawals((withdrawals) => {
      let totalWithdrawals = 0;
      withdrawals.forEach(withdrawal => {
        if (withdrawal.status === 'completed') {
          totalWithdrawals += Number(withdrawal.amount || 0);
        }
      });
      retirados.value = Number(totalWithdrawals.toFixed(2));
      logInfo('Total retiros actualizados:', retirados.value);
    }, props.showAllData);

  } catch (error) {
    logError('Error en la inicialización del dashboard:', error);
  }
};

watch(() => props.showAllData, () => {
  setupSubscriptions();
});

onMounted(() => {
  setupSubscriptions();
});

onUnmounted(() => {
  if (unsubscribeUsers) unsubscribeUsers();
  if (unsubscribeWithdrawals) unsubscribeWithdrawals();
  if (unsubscribeInvestments) unsubscribeInvestments();
});
</script>

<template>
  <section class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-8">
    <Card
        v-for="(card, index) in cardsData"
        :key="index"
        :title="card.title"
        :value="card.value"
        :percentage="card.percentage"
        :icon="card.icon"
    />
  </section>
</template>

<style scoped>
</style>