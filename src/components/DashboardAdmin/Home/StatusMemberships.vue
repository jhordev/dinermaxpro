<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Pie } from 'vue-chartjs';
import {Chart as ChartJS, Title, Tooltip, Legend, ArcElement,} from 'chart.js';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { subscribeToMembershipsStatus } from '@/services/users_list_service';
import { logInfo } from '@/utils/logger';

const props = defineProps({
  showAllData: {
    type: Boolean,
    default: false
  }
});

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const activeInvestments = ref(0);
const inactiveInvestments = ref(0);

const data = ref({
  labels: ['Activas', 'No Activas'],
  datasets: [
    {
      label: 'Estado de Membresías',
      data: [0, 0],
      backgroundColor: ['#7586FF', '#FF49A0'],
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

let unsubscribe = null;

const setupSubscription = () => {
  if (unsubscribe) unsubscribe();

  unsubscribe = subscribeToMembershipsStatus(({active, inactive}) => {
    activeInvestments.value = active;
    inactiveInvestments.value = inactive;

    data.value = {
      ...data.value,
      datasets: [{
        ...data.value.datasets[0],
        data: [active, inactive]
      }]
    };

    logInfo(`Estado de membresías actualizado - Activas: ${active}, Inactivas: ${inactive}`);
  }, props.showAllData);
};

watch(() => props.showAllData, () => {
  setupSubscription();
});

onMounted(() => {
  setupSubscription();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
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
          Total de inversiones aprobadas: {{ activeInvestments + inactiveInvestments }}
        </p>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
</style>