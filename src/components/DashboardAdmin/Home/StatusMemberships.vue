<script setup>

import CardLayout from "@/layouts/CardLayout.vue";
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registra los componentes necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const data = {
  labels: ['Activas', 'No Activas'],
  datasets: [
    {
      label: 'Estado de Membresías',
      data: [70, 30], // Ejemplo de datos: 70 activas, 30 no activas
      backgroundColor: ['#7586FF', '#FF49A0'],
      borderWidth: 0,
      cutout: '60%', // Crea el hueco en el medio
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Distribución de Membresías',
    },
  },
};

</script>

<template>
<CardLayout >
  <div class="flex justify-between items-center">
    <h2 class="text-[18px] md:text-[30px] text-colorTextBlack dark:text-white tracking-[3px] font-bold">Estados de Menbresía</h2>
    <router-link to="/dashboardadmin/contratos" class="text-[12px] lg:text-[16px] cursor-pointer hover:scale-110 text-colorTextBlack dark:text-white"> Ver tabla </router-link>
  </div>

 <div class="mt-6 flex justify-center">
   <div class=" lg:w-[400px] ">
     <Pie  :data="data" :options="options" />
   </div>
 </div>

</CardLayout>
</template>

<style scoped>

</style>