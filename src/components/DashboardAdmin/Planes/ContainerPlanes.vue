<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AddPlanModal from "@/dialogs/PlanDialog.vue";
import CardPlan from "@/components/DashboardAdmin/Planes/CardPlan.vue";
import { Plus, Loader2 } from "lucide-vue-next";
import { planService } from '@/services/plan_service';
import { logError, logInfo } from '@/utils/logger.js';

const isModalVisible = ref(false);
const modalMode = ref("add");
const selectedPlan = ref(null);
const pricingPlans = ref([]);
const isLoading = ref(true);
let unsubscribe = null;

const formatFeatures = (descripcion, interes) => {
  return descripcion.split('\n')
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => item.startsWith('Crecimiento Diario:')
          ? `Crecimiento Diario: ${interes}%`
          : item
      );
};

const setupPlanesSubscription = () => {
  try {
    unsubscribe = planService.subscribeToPlanes(planes => {
      pricingPlans.value = planes;
      isLoading.value = false;
    });
  } catch (error) {
    logError('Error al suscribirse a planes:', error);
    isLoading.value = false;
  }
};

const handleModal = (mode, plan = null) => {
  selectedPlan.value = plan ? JSON.parse(JSON.stringify(plan)) : null;
  modalMode.value = mode;
  isModalVisible.value = true;
};

const handleDelete = async (planId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este plan?')) return;

  try {
    await planService.eliminarPlan(planId);
    logInfo('Plan eliminado exitosamente');
  } catch (error) {
    logError('Error al eliminar el plan:', error);
  }
};

const handleModalClose = () => {
  isModalVisible.value = false;
  selectedPlan.value = null;
};

onMounted(setupPlanesSubscription);
onUnmounted(() => unsubscribe?.());
</script>

<template>
  <section>
    <div class="flex justify-between items-center">
      <h2 class="text-[28px] text-colorTextBlack dark:text-white font-bold">Planes</h2>
      <button
          type="button"
          @click="() => handleModal('add')"
          class="gap-2.5 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-500"
          :disabled="isLoading"
      >
        <Loader2 v-if="isLoading" class="animate-spin" />
        <Plus v-else />
        Agregar Plan
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center mt-10">
      <Loader2 class="animate-spin w-8 h-8 text-colorBgButton" />
    </div>

    <div v-else class="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-16 pb-10 md:p-0">
      <CardPlan
          v-for="plan in pricingPlans"
          :key="plan.id"
          :planName="plan.nombrePlan"
          :priceRange="`$${plan.capitalMinimo} - $${plan.capitalMaximo}`"
          :duration="`Por ${plan.tiempoMes} meses`"
          :features="formatFeatures(plan.descripcion, plan.interes)"
          :isMostPopular="false"
          @edit="() => handleModal('update', plan)"
          @delete="() => handleDelete(plan.id)"
      />
    </div>

    <AddPlanModal
        v-model="isModalVisible"
        :mode="modalMode"
        :plan="selectedPlan"
        @update:model-value="handleModalClose"
    />
  </section>
</template>

<style scoped>
</style>