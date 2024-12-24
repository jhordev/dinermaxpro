<script setup>
import CardMembership from "@/components/Dashboard/Membership/CardMembership.vue";
import { ref, onMounted, onUnmounted } from 'vue';
import AddPlanModal from "@/components/Dashboard/Membership/AddPlanModal.vue";
import { planService } from '@/services/plan_service';

const isModalVisible = ref(false);
const pricingPlans = ref([]);
let unsubscribe;

const openModal = () => {
  isModalVisible.value = true;
};

const handleSubmit = async (planData) => {
  try {
    await planService.crearPlan(planData);
    isModalVisible.value = false;
  } catch (error) {
    console.error('Error al crear plan:', error);
  }
};

const formatFeatures = (descripcion, interes) => {
  const features = [];

  // Agregar crecimiento diario con el interés real
  features.push(`Crecimiento Diario: ${interes}%`);

  // Procesar el resto de características
  const lines = descripcion.split('\n').map(line => line.trim());

  lines.forEach(line => {
    if (!line.startsWith('Crecimiento Diario:') && line) {
      features.push(line);
    }
  });

  return features;
};

onMounted(() => {
  unsubscribe = planService.subscribeToPlanes((planes) => {
    pricingPlans.value = planes.map(plan => ({
      id: plan.id,
      planName: plan.nombrePlan,
      priceRange: `$${plan.capitalMinimo.toLocaleString()} - $${plan.capitalMaximo.toLocaleString()}`,
      duration: `Por ${plan.tiempoMes} meses`,
      features: formatFeatures(plan.descripcion, plan.interes),
      interes: plan.interes
    }));
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <section class="flex flex-col md:flex-row gap-5 md:gap-10 pb-10 md:p-0">
    <CardMembership
        v-for="plan in pricingPlans"
        :key="plan.id"
        :planName="plan.planName"
        :priceRange="plan.priceRange"
        :duration="plan.duration"
        :features="plan.features"
        :interes="plan.interes"
        :onChoosePlan="openModal"
    />
    <AddPlanModal
        v-model="isModalVisible"
        @submit="handleSubmit"
    />
  </section>
</template>

<style scoped>
</style>
