<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { EyeOff, Eye } from 'lucide-vue-next';
import { investmentService } from '@/services/investment_service';
import { referralService } from '@/services/referral_service';
import { auth } from '@/services/firebase_config';
import { logError, logInfo } from '@/utils/logger';

const props = defineProps({
  userId: {
    type: String,
    required: true,
  }
});

const investments = ref([]);
const referralStats = ref({
  ownReferral: {
    totalReferrals: 0,
    earnings: 0
  }
});
const isHidden = ref(false);
const dataLoaded = ref(false);
let unsubscribeInvestments = null;
let unsubscribeReferrals = null;

const totals = computed(() => {
  if (!dataLoaded.value) {
    return {
      totalAmount: '0.00',
      totalInUSD: '0.00 USD'
    };
  }

  const userInvestments = investments.value.filter(inv => inv.userId === props.userId);
  const referralEarnings = Number(referralStats.value.ownReferral.earnings) || 0;

  const total = userInvestments.reduce((acc, inv) => {
    if (inv.status === 'approved') {
      const investment = Number(inv.investment) || 0;
      const earnings = Number(inv.earnings) || 0;
      acc.totalBalance += investment + earnings;
      acc.totalInvestment += investment;
    }
    return acc;
  }, { totalBalance: referralEarnings, totalInvestment: 0 });

  return {
    totalAmount: formatCurrency(total.totalBalance),
    totalInUSD: `${formatCurrency(total.totalInvestment)} USD`,
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
    let investmentsLoaded = false;
    let referralsLoaded = false;

    // Suscripción a inversiones
    unsubscribeInvestments = investmentService.subscribeToInvestments((allInvestments) => {
      investments.value = allInvestments;
      investmentsLoaded = true;
      if (referralsLoaded) dataLoaded.value = true;
      logInfo('Inversiones actualizadas');
    });

    // Suscripción a estadísticas de referidos
    if (auth.currentUser) {
      unsubscribeReferrals = referralService.getReferralStats(auth.currentUser.uid, (newStats) => {
        referralStats.value = newStats;
        referralsLoaded = true;
        if (investmentsLoaded) dataLoaded.value = true;
        logInfo('Estadísticas de referidos actualizadas');
      });
    }
  } catch (error) {
    logError('Error al suscribirse a los datos:', error);
  }
});

onUnmounted(() => {
  if (unsubscribeInvestments) {
    unsubscribeInvestments();
  }
  if (unsubscribeReferrals) {
    unsubscribeReferrals();
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