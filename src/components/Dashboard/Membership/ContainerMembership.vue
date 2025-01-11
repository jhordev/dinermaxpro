<script setup>
import CardMembership from "@/components/Dashboard/Membership/CardMembership.vue";
import { ref, onMounted, onUnmounted } from 'vue';
import AddPlanModal from "@/components/Dashboard/Membership/AddPlanModal.vue";
import { planService } from '@/services/plan_service';
import { investmentService } from '@/services/investment_service';
import { auth } from '@/services/firebase_config';
import { logInfo } from '@/utils/logger.js';

const isModalVisible = ref(false);
const pricingPlans = ref([]);
const selectedPlan = ref(null);
const isLoading = ref(true);
const activeInvestment = ref(null);
let unsubscribePlans;
let unsubscribeInvestments;

const openModal = (plan) => {
  selectedPlan.value = {
    id: plan.id,
    planName: plan.planName,
    porcentajeMinRetiro: plan.porcentajeMinRetiro,
    interes: plan.interes,
    tiempoMes: plan.tiempoMes,
    capitalMinimo: plan.capitalMinimo,
    capitalMaximo: plan.capitalMaximo
  };
  isModalVisible.value = true;
};

const handleSubmit = (planData) => {
  isModalVisible.value = false;
  logInfo('Plan seleccionado:', planData);
};

const formatFeatures = (descripcion, interes) => {
  const features = [];
  features.push(`Crecimiento Diario: ${interes}%`);
  const lines = descripcion.split('\n').map(line => line.trim());
  lines.forEach(line => {
    if (!line.startsWith('Crecimiento Diario:') && line) {
      features.push(line);
    }
  });
  return features;
};

const isInvestmentActive = (investment) => {
  if (!investment) return false;
  if (investment.status !== 'approved') return false;

  const now = new Date();
  const expirationDate = investment.expirationDate?.toDate();

  return expirationDate && now <= expirationDate;
};

onMounted(() => {
  isLoading.value = true;

  unsubscribePlans = planService.subscribeToPlanes((planes) => {
    pricingPlans.value = planes.map(plan => ({
      id: plan.id,
      planName: plan.nombrePlan,
      porcentajeMinRetiro: plan.porcentajeMinRetiro,
      capitalMinimo: plan.capitalMinimo,
      capitalMaximo: plan.capitalMaximo,
      priceRange: `$${plan.capitalMinimo.toLocaleString()} - $${plan.capitalMaximo.toLocaleString()}`,
      duration: `Por ${plan.tiempoMes} meses`,
      tiempoMes: plan.tiempoMes,
      features: formatFeatures(plan.descripcion, plan.interes),
      interes: plan.interes
    }));
  });

  if (auth.currentUser) {
    unsubscribeInvestments = investmentService.subscribeToInvestments((investments) => {
      const activeInv = investments.find(inv =>
          inv.userId === auth.currentUser.uid &&
          isInvestmentActive(inv)
      );
      activeInvestment.value = activeInv;
      isLoading.value = false;
    }, 'user', auth.currentUser.uid);
  }
});

onUnmounted(() => {
  if (unsubscribePlans) unsubscribePlans();
  if (unsubscribeInvestments) unsubscribeInvestments();
});
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 pb-10 md:p-0">
    <CardMembership
        v-for="plan in pricingPlans"
        :key="plan.id"
        :planName="plan.planName"
        :priceRange="plan.priceRange"
        :duration="plan.duration"
        :features="plan.features"
        :interes="plan.interes"
        :is-active="activeInvestment?.planId === plan.id"
        :disabled="isInvestmentActive(activeInvestment)"
        :is-loading="isLoading"
        @choose-plan="() => openModal(plan)"
    />
    <AddPlanModal
        v-model="isModalVisible"
        :selected-plan="selectedPlan"
        @submit="handleSubmit"
    />
  </section>
</template>

<style scoped>
</style>