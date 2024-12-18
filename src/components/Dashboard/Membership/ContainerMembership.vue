<script setup>
import CardMembership from "@/components/Dashboard/Membership/CardMembership.vue";
import { ref } from 'vue';
import AddPlanModal from "@/components/Dashboard/Membership/AddPlanModal.vue";

const isModalVisible = ref(false);
const selectedPlan = ref(null);

const openModal = (plan) => {
  selectedPlan.value = plan;
  isModalVisible.value = true;
};

const pricingPlans = [
  {
    planName: "Plan Básico",
    priceRange: "$1000 - $4999",
    duration: "Por 6 meses",
    features: [
      "Crecimiento Diario: 0.3%",
      "Retiro de Ganancias: Permitido después del 15% del tiempo del plan (aproximadamente a los 27 días)",
      "Acceso a Soporte Básico: Atención al cliente para resolver dudas sobre el plan y la plataforma.",
      "Actualizaciones Diarias de Rendimiento: Informe diario del crecimiento y rendimiento de tu inversión.",
    ],
    isMostPopular: true,
  },
  {
    planName: "Plan Avanzado",
    priceRange: "$5000 - $9999",
    duration: "Por 12 meses",
    features: [
      "Crecimiento Diario: 0.5%",
      "Retiro de Ganancias: Permitido después del 10% del tiempo del plan (aproximadamente a los 36 días)",
      "Acceso a Soporte Premium: Atención dedicada 24/7.",
      "Actualizaciones Diarias de Rendimiento: Informe diario con métricas avanzadas.",
    ],
    isMostPopular: false,
  },
  {
    planName: "Plan Pro",
    priceRange: "$10,000+",
    duration: "Por 24 meses",
    features: [
      "Crecimiento Diario: 1.0%",
      "Retiro de Ganancias: Permitido después del 5% del tiempo del plan (aproximadamente a los 36 días)",
      "Acceso a Soporte VIP: Atención prioritaria 24/7.",
      "Actualizaciones Detalladas de Rendimiento: Informe diario avanzado con asesoramiento personalizado.",
    ],
    isMostPopular: false,
  },
];
</script>

<template>
  <section class="flex flex-col md:flex-row gap-5 md:gap-20 pb-10 md:p-0">
    <CardMembership
        v-for="(plan, index) in pricingPlans"
        :key="index"
        :planName="plan.planName"
        :priceRange="plan.priceRange"
        :duration="plan.duration"
        :features="plan.features"
        :isMostPopular="plan.isMostPopular"
        @open-modal="() => openModal(plan)"
    />
  </section>
</template>

<style scoped>
</style>
