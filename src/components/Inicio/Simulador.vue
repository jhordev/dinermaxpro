<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ArrowDownUp } from 'lucide-vue-next';
import { planService } from '@/services/plan_service';

const plans = ref([]);
const selectedPlanId = ref(''); // Iniciamos vacío
const investmentAmount = ref('');
const earnings = ref('0');
const inputError = ref(false);
const errorMessage = ref('');

const selectedPlan = computed(() => {
  return plans.value.find(plan => plan.id === selectedPlanId.value) || null;
});

const fetchPlans = async () => {
  try {
    await planService.subscribeToPlanes((planes) => {
      plans.value = planes.map(plan => ({
        id: plan.id,
        planName: plan.nombrePlan,
        capitalMinimo: plan.capitalMinimo,
        capitalMaximo: plan.capitalMaximo,
        tiempoMes: plan.tiempoMes,
        interes: plan.interes
      }));
      // Eliminamos la selección automática del primer plan
      // if (plans.value.length > 0) {
      //   selectedPlanId.value = plans.value[0].id;
      // }
    });
  } catch (error) {
    console.error('Error al obtener los planes:', error);
  }
};

const calculateBusinessDays = (startDate, endDate) => {
  let count = 0;
  const curDate = new Date(startDate);

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
};

const updateEarnings = () => {
  const amount = Number(investmentAmount.value);

  if (!selectedPlan.value || isNaN(amount)) {
    earnings.value = '0';
    inputError.value = false;
    errorMessage.value = '';
    return;
  }

  if (amount < selectedPlan.value.capitalMinimo) {
    inputError.value = true;
    errorMessage.value = `El monto debe estar entre $${selectedPlan.value.capitalMinimo.toLocaleString()} y $${selectedPlan.value.capitalMaximo.toLocaleString()}`;
    earnings.value = '0';
  } else if (amount > selectedPlan.value.capitalMaximo) {
    inputError.value = true;
    errorMessage.value = `El monto debe estar entre $${selectedPlan.value.capitalMinimo.toLocaleString()} y $${selectedPlan.value.capitalMaximo.toLocaleString()}`;
    earnings.value = '0';
  } else {
    inputError.value = false;
    errorMessage.value = '';

    const meses = Number(selectedPlan.value.tiempoMes);
    const interes = Number(selectedPlan.value.interes) / 100;

    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + meses);

    const diasLaborales = calculateBusinessDays(fechaInicio, fechaFin);
    earnings.value = ((amount * interes) * diasLaborales).toFixed(2);
  }
};

watch([investmentAmount, selectedPlanId], updateEarnings);

onMounted(fetchPlans);
</script>

<template>
  <section class="container-section pt-[45px] md:pt-[105px] flex flex-col items-center w-full" id="simulator">
    <h2 class="text-center text-[32px] md:text-[60px] leading-10 md:leading-[140%] text-colorTextBlack dark:text-white font-black">
      Simulador de Ganancias
    </h2>
    <div
        class="border-8 border-[#B6B2FF80] dark:border-none dark:bg-colorSimulador py-11 px-5 mt-4 md:mt-8
             rounded-[30px] flex flex-col items-center gap-6 md:max-w-[630px] md:px-[135px]"
    >
      <!-- Selector de plan -->
      <div class="flex flex-col gap-[6px] w-full">
        <label class="text-colorGray font-semibold">Elige el Plan</label>
        <div class="bg-colorInputClaro dark:bg-colorTextBlack rounded-[7px] w-full p-[7px] h-[65px]">
          <select
              v-model="selectedPlanId"
              class="h-full block w-full p-2 mb-6 text-[14px] font-bold uppercase text-gray-900 rounded-[3.5px]
                   bg-white outline-none dark:bg-colorInput dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          >
            <!-- Opción placeholder sin valor -->
            <option value="" selected>Seleccione el plan</option>
            <!-- Opciones de planes -->
            <option v-for="plan in plans" :key="plan.id" :value="plan.id">
              {{ plan.planName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Monto de inversión -->
      <div class="flex flex-col gap-[6px] w-full">
        <label class="text-colorGray font-semibold">Monto</label>
        <div
            class="bg-colorInputClaro dark:bg-colorTextBlack rounded-[7px] w-full p-[7px] h-[65px]
                 grid grid-cols-2"
        >
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center
                   gap-[10px] w-fit rounded-[3.5px]"
          >
            <div class="bg-[#50AF95] p-1 rounded-full">
              <img src="@/assets/img/usdt.svg" class="w-4 h-4" />
            </div>
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">
              usdt
            </span>
          </div>
          <input
              v-model="investmentAmount"
              type="number"
              :class="[
              'bg-transparent',
              'font-semibold',
              'text-end',
              'pr-2',
              'text-colorTextBlack',
              'dark:text-white',
              'outline-none',
              'no-spinner',
              !selectedPlan ? 'hidden' : ''
            ]"
              :placeholder="selectedPlan
              ? `$${selectedPlan.capitalMinimo.toLocaleString()} - $${selectedPlan.capitalMaximo.toLocaleString()}`
              : 'Selecciona un plan'"
          />
        </div>
        <p
            v-if="inputError"
            class="mt-1 text-[10px] md:text-[12px] text-yellow-600 dark:text-yellow-200"
        >
          {{ errorMessage }}
        </p>
      </div>

      <ArrowDownUp class="text-colorTextBlack dark:text-white" />

      <!-- Ganancias -->
      <div class="flex flex-col gap-[6px] w-full">
        <label class="text-colorGray font-semibold">Ganancias Aproximadas</label>
        <div
            class="bg-colorInputClaro dark:bg-colorTextBlack rounded-[7px] w-full p-[7px] h-[65px]
                 grid grid-cols-2"
        >
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center
                   gap-[10px] w-fit rounded-[3.5px]"
          >
            <div class="bg-[#50AF95] p-1 rounded-full">
              <img src="@/assets/img/usdt.svg" class="w-4 h-4" />
            </div>
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">
              usdt
            </span>
          </div>
          <input
              type="text"
              readonly
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none"
              :value="`$${earnings}`"
          />
        </div>
      </div>

      <!-- Botón que aparece si hay ganancias diferentes de '0' -->
      <RouterLink
          v-if="earnings !== '0'"
          to="/register"
          class="rounded-[8px] mt-7 bg-colorBgButton w-full text-center py-3 text-[16px] text-white font-semibold"
      >
        Quiero empezar a ganar
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  -moz-appearance: textfield; /* Para Firefox */
}
</style>
