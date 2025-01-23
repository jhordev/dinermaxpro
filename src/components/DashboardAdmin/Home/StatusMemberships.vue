<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Pie } from 'vue-chartjs';
import {Chart as ChartJS, Title, Tooltip, Legend, ArcElement,} from 'chart.js';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { subscribeToMembershipsStatus, subscribeToUsersList } from '@/services/users_list_service';
import { logInfo, logError } from '@/utils/logger';

const props = defineProps({
  showAllData: {
    type: Boolean,
    default: false
  }
});

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const activeInvestments = ref(0);
const inactiveInvestments = ref(0);
const usersWithoutPlan = ref(0);
const unsubscribeMemberships = ref(null);
const unsubscribeUsers = ref(null);

const data = ref({
  labels: ['Activas', 'No Activas', 'Sin Plan'],
  datasets: [
    {
      label: 'Estado de Membresías',
      data: [0, 0, 0],
      backgroundColor: ['#7586FF', '#FF49A0', '#FFB800'],
      borderWidth: 0,
      cutout: '60%',
    },
  ],
});

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Distribución de Membresías',
    },
  },
};

const updateChartData = () => {
  data.value = {
    ...data.value,
    datasets: [{
      ...data.value.datasets[0],
      data: [activeInvestments.value, inactiveInvestments.value, usersWithoutPlan.value]
    }]
  };
};

const setupSubscriptions = async () => {
  try {
    // Limpiar suscripciones anteriores
    if (unsubscribeMemberships.value) {
      unsubscribeMemberships.value();
    }
    if (unsubscribeUsers.value) {
      unsubscribeUsers.value();
    }

    // Establecer nuevas suscripciones
    unsubscribeMemberships.value = subscribeToMembershipsStatus(({active, inactive}) => {
      activeInvestments.value = active;
      inactiveInvestments.value = inactive;
      updateChartData();
    }, props.showAllData);

    unsubscribeUsers.value = await subscribeToUsersList((users) => {
      const totalUsersWithoutPlan = users.filter(user => !user.hasActivePlan).length;
      usersWithoutPlan.value = totalUsersWithoutPlan;
      updateChartData();
      logInfo(`Usuarios sin plan: ${totalUsersWithoutPlan}`);
    }, props.showAllData);
  } catch (error) {
    logError('Error al configurar las suscripciones:', error);
  }
};

watch(() => props.showAllData, () => {
  setupSubscriptions();
});

onMounted(() => {
  setupSubscriptions();
});

onUnmounted(() => {
  try {
    if (unsubscribeMemberships.value) {
      unsubscribeMemberships.value();
    }
    if (unsubscribeUsers.value) {
      unsubscribeUsers.value();
    }
  } catch (error) {
    logError('Error al limpiar suscripciones:', error);
  }
});
</script>

<template>
  <CardLayout>
    <div class="flex justify-between items-center">
      <h2 class="text-[18px] md:text-[30px] text-colorTextBlack dark:text-white tracking-[3px] font-bold">
        Estados de Membresía
      </h2>
    </div>

    <div class="mt-6 flex flex-col items-center">
      <div class="lg:w-[400px]">
        <Pie :data="data" :options="options"/>
      </div>
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Total de usuarios: {{ activeInvestments + inactiveInvestments + usersWithoutPlan }}
        </p>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
</style>