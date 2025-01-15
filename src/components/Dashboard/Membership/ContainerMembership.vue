<script setup>
import CardMembership from "@/components/Dashboard/Membership/CardMembership.vue";
import { ref, onMounted, onUnmounted } from 'vue';
import AddPlanModal from "@/components/Dashboard/Membership/AddPlanModal.vue";
import ProfileVerificationDialog from '@/dialogs/ProfileVerificationDialog.vue';
import { planService } from '@/services/plan_service';
import { investmentService } from '@/services/investment_service';
import { userService } from '@/services/user_service';
import { auth } from '@/services/firebase_config';
import { logInfo, logError } from '@/utils/logger.js';

const isModalVisible = ref(false);
const isProfileDialogVisible = ref(false);
const pricingPlans = ref([]);
const selectedPlan = ref(null);
const isLoading = ref(true);
const activeInvestment = ref(null);
const userData = ref(null);
let unsubscribePlans;
let unsubscribeInvestments;
let unsubscribeUser;

const validateUserProfile = () => {
  const requiredFields = ['wallet', 'telefono', 'pais'];
  return requiredFields.some(field => !userData.value?.[field]);
};

const openModal = async (plan) => {
  try {
    if (validateUserProfile()) {
      isProfileDialogVisible.value = true;
      return;
    }

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
    logInfo('Modal abierto para el plan:', plan.planName);
  } catch (error) {
    logError('Error al abrir el modal:', error);
  }
};

const handleSubmit = (planData) => {
  try {
    isModalVisible.value = false;
    logInfo('Plan seleccionado:', planData);
  } catch (error) {
    logError('Error al manejar el envío del plan:', error);
  }
};

const formatFeatures = (descripcion, interes) => {
  try {
    const features = [];
    features.push(`Crecimiento Diario: ${interes}%`);
    const lines = descripcion.split('\n').map(line => line.trim());
    lines.forEach(line => {
      if (!line.startsWith('Crecimiento Diario:') && line) {
        features.push(line);
      }
    });
    return features;
  } catch (error) {
    logError('Error al formatear características:', error);
    return [];
  }
};

const isInvestmentActive = (investment) => {
  if (!investment) return false;
  if (investment.status === 'pending' || investment.status === 'approved') return true;

  const now = new Date();
  const expirationDate = investment.expirationDate?.toDate();

  return expirationDate && now <= expirationDate;
};

onMounted(() => {
  try {
    isLoading.value = true;

    if (auth.currentUser) {
      unsubscribeUser = userService.subscribeToUser((response) => {
        if (response.success) {
          userData.value = response.data;
          logInfo('Datos de usuario cargados');
        } else {
          logError('Error al cargar datos del usuario:', response.error);
        }
      });
    }

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
      logInfo('Planes cargados exitosamente');
    });

    if (auth.currentUser) {
      unsubscribeInvestments = investmentService.subscribeToInvestments((investments) => {
        const activeInv = investments.find(inv =>
            inv.userId === auth.currentUser.uid &&
            isInvestmentActive(inv)
        );
        activeInvestment.value = activeInv;
        isLoading.value = false;
        logInfo('Inversiones cargadas exitosamente');
      }, 'user', auth.currentUser.uid);
    } else {
      isLoading.value = false;
    }
  } catch (error) {
    logError('Error en onMounted:', error);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  try {
    if (unsubscribePlans) unsubscribePlans();
    if (unsubscribeInvestments) unsubscribeInvestments();
    if (unsubscribeUser) unsubscribeUser();
    logInfo('Componente desmontado exitosamente');
  } catch (error) {
    logError('Error al desmontar componente:', error);
  }
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
        :is-active="activeInvestment?.planId === plan.id && activeInvestment?.status === 'approved'"
        :disabled="isInvestmentActive(activeInvestment)"
        :is-loading="isLoading"
        :investment-status="activeInvestment?.planId === plan.id ? activeInvestment?.status : null"
        @choose-plan="() => openModal(plan)"
    />

    <AddPlanModal
        v-model="isModalVisible"
        :selected-plan="selectedPlan"
        @submit="handleSubmit"
    />

    <ProfileVerificationDialog
        v-model="isProfileDialogVisible"
        :userData="userData || {}"
    />
  </section>
</template>

<style scoped>
.section {
  @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>