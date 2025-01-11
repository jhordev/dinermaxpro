<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { subscribeToActivePlansByType } from '@/services/users_list_service';

const props = defineProps({
  showAllData: {
    type: Boolean,
    default: false
  }
});

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Suscriptores',
      data: [],
      backgroundColor: ['#9F9FF8', '#96E2D6', '#92BFFF'],
    },
  ],
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
};

const totalSuscriptores = computed(() => {
  return chartData.value.datasets[0].data.reduce((acc, curr) => acc + curr, 0);
});

let unsubscribe = null;

const setupSubscription = () => {
  if (unsubscribe) unsubscribe();

  unsubscribe = subscribeToActivePlansByType(({ labels, data }) => {
    chartData.value = {
      labels,
      datasets: [{
        ...chartData.value.datasets[0],
        data
      }]
    };
  }, props.showAllData);
};

watch(() => props.showAllData, () => {
  setupSubscription();
});

onMounted(() => {
  setupSubscription();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <CardLayout>
    <h3 class="text-[18px] text-colorTextBlack font-semibold dark:text-white">
      Suscriptores por plan
    </h3>
    <Bar
        class="mt-4"
        id="my-chart-id"
        :options="chartOptions"
        :data="chartData"
    />
    <div class="mt-6 flex flex-col items-center">
      <div class="flex flex-wrap justify-center gap-4">
        <div
            v-for="(label, index) in chartData.labels"
            :key="label"
            class="flex items-center gap-2 text-sm"
        >
          <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
          ></div>
          <span class="text-gray-600 dark:text-gray-300">
            {{ label }}: {{ chartData.datasets[0].data[index] }}
          </span>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span>Total de suscriptores activos:</span>
        <span class="font-bold text-primary">{{ totalSuscriptores }}</span>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
</style>