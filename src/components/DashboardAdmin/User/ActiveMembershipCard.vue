<script setup>
import {ref, computed, watch} from 'vue'
import {subscribeToUserInvestment} from '@/services/users_list_service'
import {referralService} from '@/services/referral_service'
import {Loader2} from "lucide-vue-next"
import inteIcon from '@/assets/img/interes.svg'
import refIcon from '@/assets/img/item1.png'
import refDinnerIcon from '@/assets/img/item2.png'
import {Pie} from 'vue-chartjs'
import {Chart as ChartJS, Title, Tooltip, Legend, ArcElement} from 'chart.js'
import {logError, logInfo} from '@/utils/logger'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const investment = ref(null)
const daysMetrics = ref({
  daysElapsed: 0,
  totalPaymentDays: 0,
  percentage: 0
})
const referralData = ref(null)
const isLoading = ref(true)

const getPaymentDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setDate(start.getDate() + 2);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 1) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(count, 0);
};

const calculateDaysMetrics = (investment) => {
  if (!investment || investment.status !== 'approved') {
    return {daysElapsed: 0, totalPaymentDays: 0, percentage: 0};
  }

  const now = new Date();
  const activationDate = new Date(investment.activationDate.seconds * 1000);
  const expirationDate = new Date(investment.expirationDate.seconds * 1000);

  const daysElapsed = getPaymentDays(activationDate, now);
  const totalPaymentDays = getPaymentDays(activationDate, expirationDate);
  const percentage = Math.min(Math.round((daysElapsed / totalPaymentDays) * 100), 100);

  return {daysElapsed, totalPaymentDays, percentage};
};

function subscribeToUserInvestmentPromise(id) {
  return new Promise((resolve, reject) => {
    subscribeToUserInvestment(id, data => resolve(data), err => reject(err))
  })
}

function getReferralStatsPromise(id) {
  return new Promise((resolve, reject) => {
    referralService.getReferralStats(id, data => resolve(data), err => reject(err))
  })
}

const formatDate = t => {
  if (!t) return ''
  return new Date(t.seconds * 1000).toLocaleDateString()
}

const formatCurrency = v => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(v || 0)
}

const data = computed(() => ({
  labels: ['Días Recorrido', 'Días Faltantes'],
  datasets: [
    {
      label: 'Días',
      data: [
        daysMetrics.value.daysElapsed,
        daysMetrics.value.totalPaymentDays - daysMetrics.value.daysElapsed
      ],
      backgroundColor: ['#7586FF', '#FF49A0'],
      borderWidth: 0,
      cutout: '60%'
    }
  ]
}))

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'top'
    },
    title: {
      display: false,
      text: 'Distribución de Días'
    }
  }
}

watch(
    () => props.userId,
    async newId => {
      if (newId) {
        isLoading.value = true
        try {
          const [investmentData, referralStatsData] = await Promise.all([
            subscribeToUserInvestmentPromise(newId),
            getReferralStatsPromise(newId)
          ])
          investment.value = investmentData
          daysMetrics.value = calculateDaysMetrics(investmentData)
          referralData.value = referralStatsData
          logInfo('Datos de inversión y referidos actualizados correctamente')
        } catch (e) {
          logError('Error al cargar los datos:', e)
        } finally {
          isLoading.value = false
        }
      }
    },
    {immediate: true}
)
</script>

<template>
  <section class="p-5 shadow-custom-card-info rounded-[14px] relative">
    <div v-if="isLoading"
         class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
      <Loader2 class="w-8 h-8 animate-spin text-blue-500"/>
    </div>

    <header class="border-b border-gray:50 dark:border-colorGray2 pb-2.5">
      <div class="flex items-center justify-between text-colorTextBlack dark:text-white">
        <h3 class="text-[16px] font-bold tracking-[1.6px]">Membresía activa</h3>
        <span class="text-[12px] font-bold tracking-[1.6px]">{{ investment?.planName || 'Ninguno' }}</span>
      </div>
      <div class="flex items-center justify-between text-colorTextBlack dark:text-white mt-1.5">
        <span class="text-[10px] font-normal">Capital: {{ formatCurrency(investment?.investment || 0) }}</span>
        <span class="text-[10px] font-normal">
          Rango: {{
            investment ? `${formatDate(investment.activationDate)} a ${formatDate(investment.expirationDate)}` : 'Sin plan activo'
          }}
        </span>
      </div>
    </header>

    <main class="flex flex-col lg:flex-row mt-5 gap-6 items-center">
      <div class="flex-1 grid grid-cols-4 w-full gap-5">
        <div
            class="col-span-2 lg:col-span-4 bg-colorGraySecundary rounded-[10px] py-2.5 px-2.5 flex-1 flex flex-col md:flex-row items-start md:items-center gap-2.5">
          <img :src="inteIcon" alt="Icono de fecha" class="w-[20px] md:w-[35px] rounded-full"/>
          <div class="flex flex-col gap-1.5">
            <h3 class="text-[12px] font-medium">Interés</h3>
            <strong class="text-[14px] font-black">
              {{ formatCurrency(investment?.earnings || 0) }}
            </strong>
          </div>
        </div>
        <div
            class="col-span-2 lg:col-span-4 bg-colorGraySecundary rounded-[10px] py-2.5 px-2.5 flex-1 flex flex-col md:flex-row items-start md:items-center gap-2.5">
          <img :src="refIcon" alt="Icono de fecha" class="w-[20px] md:w-[35px] rounded-full"/>
          <div class="flex flex-col gap-1.5">
            <h3 class="text-[12px] font-medium">Referidos</h3>
            <strong class="text-[14px] font-black">
              {{ referralData?.ownReferral?.totalReferrals || 0 }}
            </strong>
          </div>
        </div>
        <div
            class="col-span-4 bg-colorGraySecundary rounded-[10px] py-2.5 px-2.5 flex-1 flex flex-col md:flex-row items-start md:items-center gap-2.5">
          <img :src="refDinnerIcon" alt="Icono de fecha" class="w-[20px] md:w-[35px] rounded-full"/>
          <div class="flex flex-col gap-1.5">
            <h3 class="text-[12px] font-medium">Ganancias x referidos</h3>
            <strong class="text-[14px] font-black">
              {{ formatCurrency(referralData?.ownReferral?.earnings || 0) }}
            </strong>
          </div>
        </div>
      </div>
      <div class="relative flex-1 justify-center w-[140px] lg:w-[180px]">
        <Pie :data="data" :options="options"/>
        <div class="absolute top-[58px] left-[53px] lg:top-[40%] lg:left-[36%] flex flex-col items-center">
          <span class="text-[18px] lg:text-[25px] font-bold text-colorTextBlack dark:text-white">
            {{ daysMetrics.percentage }}%
          </span>
          <span class="text-[12px] text-colorGraydark">Días</span>
        </div>
      </div>
    </main>
  </section>
</template>

<style scoped>
</style>