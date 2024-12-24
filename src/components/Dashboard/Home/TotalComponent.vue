<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { EyeOff, Eye } from 'lucide-vue-next';
import { investmentService } from '@/services/investment_service';
import { logError, logInfo } from '@/utils/logger';

const props = defineProps({
  userId: {
    type: String,
    required: true,
  }
});

const investments = ref([]);
const isHidden = ref(false);
let unsubscribe = null;

const totals = computed(() => {
  const userInvestments = investments.value.filter(inv => inv.userId === props.userId);

  const total = userInvestments.reduce((acc, inv) => {
    if (inv.status === 'approved') {
      const investment = Number(inv.investment) || 0;
      const earnings = Number(inv.earnings) || 0;
      acc.totalBalance += investment + earnings;
      acc.totalInvestment += investment;
    }
    return acc;
  }, { totalBalance: 0, totalInvestment: 0 });

  return {
    totalAmount: formatCurrency(total.totalBalance),
    totalInUSD: `${formatCurrency(total.totalInvestment)} USD`
  };
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const generateMask = () => '******';

const toggleVisibility = () => {
  isHidden.value = !isHidden.value;
};

onMounted(() => {
  try {
    unsubscribe = investmentService.subscribeToInvestments((allInvestments) => {
      investments.value = allInvestments;
      logInfo('Inversiones actualizadas');
    });
  } catch (error) {
    logError('Error al suscribirse a inversiones:', error);
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <section class="flex gap-5 items-center">
    <div class="flex flex-col gap-0.5">
      <h3 class="text-[16px] text-colorGraydark tracking-[1.6px] font-bold">Total Balance</h3>

      <strong class="text-colorTextBlack dark:text-white text-[30px] tracking-[3px] font-bold">
        $ {{ isHidden ? generateMask() : totals.totalAmount }}
      </strong>

      <span class="text-[16px] text-colorGraydark tracking-[1.6px] font-bold">
        ~ {{ isHidden ? `${generateMask()} USD` : totals.totalInUSD }}
      </span>
    </div>

    <button
        @click="toggleVisibility"
        aria-label="Toggle visibility"
        class="hover:opacity-80 transition-opacity"
    >
      <EyeOff
          v-if="!isHidden"
          class="text-[24px] text-colorGraydark cursor-pointer"
      />
      <Eye
          v-else
          class="text-[24px] text-colorGraydark cursor-pointer"
      />
    </button>
  </section>
</template>

<style scoped>
button {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>