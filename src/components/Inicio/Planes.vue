<script setup>
import CardPricing from "@/components/Inicio/Shared/CardPricing.vue";
import { planService } from '@/services/plan_service';
import { ref, onMounted, onUnmounted } from "vue";
import { logInfo } from "@/utils/logger.js";

const pricingPlans = ref([]);
let unsubscribePlans;

const formatFeatures = (descripcion, interes) => {
  if (descripcion) {
    return descripcion.split(/\n+/).map(item => item.trim()).filter(item => item);
  }
  return ["Sin descripción disponible", `Interés: ${interes}%`];
};

onMounted(() => {
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
});

onUnmounted(() => {
  if (unsubscribePlans) {
    unsubscribePlans();
  }
});
</script>

<template>
  <section class="pt-[55px] md:pt-[100px] container-section" >
    <h2 id="plans" class="text-colorTextBlack dark:text-white text-[32px] md:text-[60px] font-extrabold">
      Planes
    </h2>
    <div class="mt-4 md:mt-[36px] flex flex-col gap-5 md:flex-row md:mx-8">
      <CardPricing
          v-for="plan in pricingPlans"
          :key="plan.id"
          :planName="plan.planName"
          :priceRange="plan.priceRange"
          :duration="plan.duration"
          :features="plan.features"
          :interes="plan.interes"
      />
    </div>
  </section>
</template>

<style scoped></style>
