<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import dateIcon from '@/assets/img/date.svg';
import graphIcon from '@/assets/img/grafico.svg';
import { investmentService } from '@/services/investment_service';
import { logError, logInfo } from '@/utils/logger';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const activeInvestment = ref(null);
const isLoading = ref(true);
let unsubscribe = null;

const getBusinessDaysDifference = (startDate, endDate) => {
  let count = 0;
  const curDate = new Date(startDate);
  const end = new Date(endDate);

  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

const investmentMetrics = computed(() => {
  if (!activeInvestment.value || activeInvestment.value.status !== 'approved') {
    return {
      daysElapsed: 0,
      totalBusinessDays: 0,
      percentage: 0,
      earnings: 0
    };
  }

  const now = new Date();
  const activationDate = activeInvestment.value.activationDate.toDate();
  const expirationDate = activeInvestment.value.expirationDate.toDate();

  const daysElapsed = getBusinessDaysDifference(activationDate, now);
  const totalBusinessDays = getBusinessDaysDifference(activationDate, expirationDate);
  const percentage = Math.min(Math.round((daysElapsed / totalBusinessDays) * 100), 100);

  return {
    daysElapsed,
    totalBusinessDays,
    percentage,
    earnings: activeInvestment.value.earnings || 0
  };
});

const chartData = computed(() => ({
  series: [
    investmentMetrics.value.daysElapsed,
    investmentMetrics.value.totalBusinessDays - investmentMetrics.value.daysElapsed
  ],
  labels: ['Días Recorrido', 'Días Faltantes']
}));

const apexOptions = {
  chart: {
    type: 'donut',
    width: 300,
  },
  colors: ['#7586FF', '#FF49A0'],
  labels: ['Días Recorrido', 'Días Faltantes'],
  legend: {
    show: false,
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 0,
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

onMounted(async () => {
  try {
    if (props.userId) {
      unsubscribe = investmentService.subscribeToInvestments((investments) => {
        const approved = investments.find(inv =>
            inv.userId === props.userId && inv.status === 'approved'
        );
        activeInvestment.value = approved || null;
        isLoading.value = false;
        logInfo('Inversión activa actualizada');
      });
    }
  } catch (error) {
    logError('Error al cargar la inversión activa:', error);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <section
      class="rounded-[15px] bg-bgCardLigth py-5 md:py-10 px-5 md:px-[34px] shadow-default dark:bg-bgDashboardDark w-full"
  >
    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <template v-else-if="activeInvestment">
      <h2 class="text-[28px] md:text-[30px] text-colorTextBlack dark:text-white tracking-[3px] font-bold">
        Membresía activa
      </h2>
      <span class="text-[14px] md:text-[16px] text-colorGraydark font-bold tracking-[1.6px] mt-1.5">
        {{ activeInvestment.planName }} de
        <strong>$ {{ activeInvestment.investment.toLocaleString() }}</strong>
      </span>

      <div class="flex flex-col md:flex-row items-center gap-10 md:gap-[100px] mt-8">
        <div class="flex md:flex-col gap-8">

          <div class="bg-colorGraySecundary rounded-[20px] py-4 px-4 flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
            <img :src="dateIcon" alt="Icono de fecha" class="w-10 md:w-auto" />
            <div class="flex flex-col gap-2.5">
              <h3 class="text-[14px] font-medium">Tiempo transcurrido</h3>
              <strong class="text-[18px] font-black">
                {{ investmentMetrics.daysElapsed }} días
              </strong>
            </div>
          </div>

          <div class="bg-colorGraySecundary rounded-[20px] py-4 px-4 flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
            <img :src="graphIcon" alt="Icono de gráfico" class="w-10 md:w-auto" />
            <div class="flex flex-col gap-2.5">
              <h3 class="text-[14px] font-medium">Ganancias generadas</h3>
              <strong class="text-[18px] font-black">
                $ {{ investmentMetrics.earnings.toLocaleString() }}
              </strong>
            </div>
          </div>
        </div>

        <div class="relative flex flex-row-reverse items-center">
          <VueApexCharts
              type="donut"
              width="300"
              :options="apexOptions"
              :series="chartData.series"
          />
          <div class="flex flex-col gap-2.5 items-end md:items-center md:absolute md:top-[29%] md:right-[39%]">
            <span class="text-[14px] font-semibold text-colorGray">Tiempo</span>
            <h3 class="text-[24px] md:text-[30px] font-bold text-colorTextBlack dark:text-white">
              {{ investmentMetrics.percentage }}%
            </h3>
            <span class="text-[14px] font-semibold text-colorGraydark">Días</span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-8">
      <p class="text-colorGraydark">No hay membresía activa</p>
    </div>
  </section>
</template>

<style scoped>
</style>
