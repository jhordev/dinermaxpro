<script setup>
import { ref } from 'vue';
import AddPlanModal from "@/dialogs/PlanDialog.vue";
import CardPlan from "@/components/DashboardAdmin/Planes/CardPlan.vue";
import { Plus } from "lucide-vue-next";

// Controlar la visibilidad del modal y el estado
const isModalVisible = ref(false);
const modalMode = ref("add");

// Función para abrir el modal en modo agregar
const openAddModal = () => {
  modalMode.value = "add";
  isModalVisible.value = true;
};

// Función para abrir el modal en modo actualizar
const openUpdateModal = () => {
  modalMode.value = "update";
  isModalVisible.value = true;
};

// Lista de planes
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
  <section>
    <div class="flex justify-between items-center">
      <h2 class="text-[28px] text-colorTextBlack dark:text-white font-bold">Planes</h2>
      <button
          type="button"
          @click="openAddModal"
          class="gap-2.5 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-500">
        <Plus />
        Agregar Plan
      </button>
      <AddPlanModal v-model="isModalVisible" :mode="modalMode" />
    </div>
    <div class="mt-10 flex flex-col md:flex-row gap-5 md:gap-10 pb-10 md:p-0">
      <CardPlan
          v-for="(plan, index) in pricingPlans"
          :key="index"
          :planName="plan.planName"
          :priceRange="plan.priceRange"
          :duration="plan.duration"
          :features="plan.features"
          :isMostPopular="plan.isMostPopular"
          :onChoosePlan="openUpdateModal"
      />
    </div>
  </section>
</template>

<style scoped>
</style>
