<script setup>
import CardPricing from "@/components/Inicio/Shared/CardPricing.vue";

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
    isMostPopular: false,
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
    isMostPopular: true,
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
  <section class="pt-[55px] md:pt-[100px] container-section">
    <h2 class="text-colorTextBlack dark:text-white text-[32px] md:text-[60px] font-extrabold">
      Planes
    </h2>
    <div class="mt-4 md:mt-[36px] flex flex-col gap-5 md:flex-row md:mx-8">
      <CardPricing
          v-for="(plan, index) in pricingPlans"
          :key="index"
          :planName="plan.planName"
          :priceRange="plan.priceRange"
          :duration="plan.duration"
          :features="plan.features"
          :isMostPopular="plan.isMostPopular"
      />
    </div>
  </section>
</template>

<style scoped></style>
