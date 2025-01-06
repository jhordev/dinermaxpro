<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import CardLayout from "@/layouts/CardLayout.vue";
import { getSystemSettings } from '@/services/system_service';
import { getUserBalances, createWithdrawalRequest } from '@/services/withdrawal_service';
import { logError, logInfo } from '@/utils/logger';

const loading = ref(false);
const systemSettings = ref({
  withdrawal: 0,
  referral: 0,
  minimumWithdrawal: 0
});

const userStatus = ref({
  hasPlan: false,
  daysRemaining: 0,
  canWithdraw: false,
  message: '',
  hasPendingWithdrawal: false,
  pendingAmount: 0
});

const saldoDis = ref(0);
const montoRetirar = ref(null);
const porcentajeRetiro = ref(null);
const totalRetiro = ref(null);
let unsubscribeBalances = null;

const loadData = async () => {
  try {
    loading.value = true;
    const settings = await getSystemSettings();
    systemSettings.value = settings;

    unsubscribeBalances = getUserBalances((balances) => {
      if (!balances) {
        logError('Error al obtener balances');
        return;
      }

      if (!balances.hasPlan) {
        userStatus.value = {
          hasPlan: false,
          canWithdraw: false,
          message: 'Necesitas adquirir un plan para realizar retiros',
          hasPendingWithdrawal: false,
          pendingAmount: 0
        };
        saldoDis.value = 0;
        return;
      }

      if (!balances.canWithdrawEarnings && !balances.isCompleted) {
        userStatus.value = {
          hasPlan: true,
          canWithdraw: false,
          daysRemaining: balances.daysForWithdrawal,
          message: `Faltan ${balances.daysForWithdrawal} días para poder realizar retiros`,
          hasPendingWithdrawal: balances.hasPendingWithdrawal,
          pendingAmount: balances.totalPendingWithdrawals
        };
        saldoDis.value = 0;
        return;
      }

      let message = '';
      if (balances.hasPendingWithdrawal) {
        message = `Tienes un retiro pendiente por $${balances.totalPendingWithdrawals}`;
      }

      userStatus.value = {
        hasPlan: true,
        canWithdraw: true,
        message,
        hasPendingWithdrawal: balances.hasPendingWithdrawal,
        pendingAmount: balances.totalPendingWithdrawals
      };

      saldoDis.value = Number(balances.total.toFixed(2));
      logInfo(`Saldo disponible actualizado: ${saldoDis.value}`);
    });

  } catch (error) {
    logError('Error al cargar datos:', error);
  } finally {
    loading.value = false;
  }
};

const isButtonDisabled = computed(() => {
  return !montoRetirar.value ||
      montoRetirar.value < systemSettings.value.minimumWithdrawal ||
      montoRetirar.value > saldoDis.value ||
      !userStatus.value.canWithdraw;
});

const inputBgClass = computed(() => {
  if (!userStatus.value.canWithdraw) return "bg-gray-300";
  if (montoRetirar.value > saldoDis.value) return "bg-red-500";
  if (montoRetirar.value >= systemSettings.value.minimumWithdrawal &&
      montoRetirar.value <= saldoDis.value) return "bg-green-500";
  return "bg-colorInputClaro dark:bg-colorTextBlack";
});

watch(montoRetirar, (newValue) => {
  if (newValue &&
      newValue >= systemSettings.value.minimumWithdrawal &&
      newValue <= saldoDis.value) {
    const comision = (newValue * (systemSettings.value.withdrawal / 100)).toFixed(2);
    porcentajeRetiro.value = comision;
    totalRetiro.value = (newValue - comision).toFixed(2);
  } else {
    porcentajeRetiro.value = null;
    totalRetiro.value = null;
  }
});

const handleWithdraw = async () => {
  if (!userStatus.value.canWithdraw) return;

  try {
    loading.value = true;
    await createWithdrawalRequest(montoRetirar.value);
    logInfo(`Retiro solicitado por: ${montoRetirar.value} USDT`);
    montoRetirar.value = null;

    // Forzar actualización de balances
    await loadData();
  } catch (error) {
    logError('Error al procesar el retiro:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

onUnmounted(() => {
  if (unsubscribeBalances) {
    unsubscribeBalances();
  }
});
</script>

<template>
  <CardLayout>
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Operación
    </h2>

    <div v-if="userStatus.message"
         :class="[
           'mt-4 p-3 rounded-lg text-center',
           userStatus.canWithdraw ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
         ]">
      {{ userStatus.message }}
    </div>

    <div class="flex flex-col items-center mt-5 gap-[20px]">
      <div class="flex flex-col gap-[6px] w-full">
        <label class="text-colorGray font-semibold">Ingrese monto a retirar</label>
        <div :class="`rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2 ${inputBgClass}`">
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
            <div class="bg-[#50AF95] p-1 rounded-full">
              <img src="@/assets/img/usdt.svg" class="w-4 h-4"/>
            </div>
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">usdt</span>
          </div>
          <input
              v-model.number="montoRetirar"
              type="number"
              :disabled="!userStatus.canWithdraw"
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none appearance-none spin-button-none"
              :placeholder="`MAX $ ${saldoDis}`"
          />
        </div>
      </div>

      <div v-if="porcentajeRetiro !== null" class="flex flex-col gap-[6px] w-full animate-fade-in">
        <div class="rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2 bg-colorInputClaro dark:bg-colorTextBlack">
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">
              - {{ systemSettings.withdrawal }}% de retiro
            </span>
          </div>
          <input
              :value="porcentajeRetiro"
              type="text"
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none appearance-none"
              disabled
          />
        </div>
      </div>

      <div v-if="totalRetiro !== null" class="flex flex-col gap-[6px] w-full animate-fade-in">
        <div class="rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2 bg-colorInputClaro dark:bg-colorTextBlack">
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">Total</span>
          </div>
          <input
              :value="totalRetiro"
              type="text"
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none appearance-none"
              disabled
          />
        </div>
      </div>
    </div>

    <button
        @click="handleWithdraw"
        :disabled="isButtonDisabled || loading"
        :class="isButtonDisabled ? 'bg-gray-400' : 'bg-colorBgButton'"
        class="font-semibold text-[18px] w-full mt-[26px] py-[18px] rounded-[10px] text-white tracking-[1.8px] flex items-center justify-center gap-2"
    >
      <Loader2 v-if="loading" class="animate-spin" size="20" />
      <span>Retirar</span>
    </button>
  </CardLayout>
</template>

<style scoped>
.bg-red-500 {
  background-color: #f87171;
}

.bg-green-500 {
  background-color: #4ade80;
}

.bg-gray-400 {
  background-color: #d1d5db;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

input[type="number"].spin-button-none::-webkit-inner-spin-button,
input[type="number"].spin-button-none::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"].spin-button-none {
  -moz-appearance: textfield;
}
</style>
