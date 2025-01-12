<script setup>
import {computed, ref} from 'vue';
import { defineProps, defineEmits } from 'vue';
import Header from "@/components/Inicio/Header.vue";
import CardInfo from "@/components/DashboardAdmin/Asistentes/CardInfo.vue";
import CardLayout from "@/layouts/CardLayout.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  membershipData: {
    type: Object,
    required: true,
    default: () => ({
      active: 0,
      inactive: 0,
    }),
  },
  subscriptionPlans: {
    type: Array,
    required: true,
    default: () => [
      { name: "Plan Básico", count: 0 },
      { name: "Plan Estándar", count: 0 },
      { name: "Plan Pro", count: 0 },
    ],
  },
  referralData: {
    type: Object,
    required: true,
    default: () => ({
      referred: 0,
      earnings: 0,
    }),
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const cardsData = computed(() => [
  {
    title: "Total de Usuarios",
    value: 1000,
  },
  {
    title: "Fondos",
    value: 1000,
  },
  {
    title: "Fondos retirados",
    value: 1000,
  },
  {
    title: "Total Fondos",
    value: 1000,
  },
]);
</script>

<template>
  <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="relative p-4 w-full max-w-full md:max-w-fit">
      <div class="relative w-full bg-white rounded-[20px] shadow dark:bg-bgModal">
        <!-- Modal Header -->
        <header class="w-full flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Información Socio 1
          </h3>
          <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </header>
        <!-- Modal Body -->
        <div class="px-6 py-4 flex flex-col gap-6 ">
          <div class="grid grid-cols-12 gap-6">
            <div v-for="(card, index) in cardsData" :key="index" class="col-span-3">
              <CardInfo :title="card.title" :value="card.value"  />
            </div>
          </div>
          <div class="grid grid-cols-12 gap-6">
            <CardLayout class="col-span-4 flex flex-col gap-3 text-colorTextBlack dark:text-white">
              <h3 class=" font-medium text-[12px] lg:text-[16px] mb-[10px]">Estados de Membresía</h3>
              <div class="flex justify-between"> <span>Activas:</span> <span>{{ membershipData.active }}</span></div>
              <div class="flex justify-between"> <span>Inactivas:</span> <span>{{ membershipData.inactive }}</span></div>
            </CardLayout>
            <CardLayout class="col-span-4 flex flex-col gap-3 text-colorTextBlack dark:text-white">
              <h3 class=" font-medium text-[12px] lg:text-[16px] mb-[10px]">Suscriptores por plan</h3>
              <div v-for="(plan, index) in subscriptionPlans" :key="index" class="flex justify-between">
                <span>{{ plan.name }}:</span> <span>{{ plan.count }}</span>
              </div>
            </CardLayout>
            <CardLayout class="col-span-4 flex flex-col gap-3 text-colorTextBlack dark:text-white">
              <h3 class=" font-medium text-[12px] lg:text-[16px] mb-[10px]">Referidos</h3>
              <div class="flex justify-between"> <span>Referidos:</span> <span>{{ referralData.referred }}</span></div>
              <div class="flex justify-between"> <span>Ganancias:</span> <span>{{ referralData.earnings }}</span></div>
            </CardLayout>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
