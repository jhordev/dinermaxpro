<script setup>

import dateIcon from "@/assets/img/date.svg";
import dateFalIcon from "@/assets/img/datefal.svg";
import inteIcon from '@/assets/img/interes.svg';
import {Pie} from "vue-chartjs";
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
  labels: ['Transcurridos', 'Faltantes'],
  datasets: [
    {
      label: 'Días',
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
      display: false,
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
  <section class="p-5 shadow-custom-card-info rounded-[14px]">
    <header class="border-b border-gray-600 pb-2.5">
      <div class="flex items-center justify-between text-colorTextBlack dark:text-white">
        <h3 class="text-[16px] font-bold tracking-[1.6px]">Menbresía activa</h3>
        <span class="text-[12px] font-bold tracking-[1.6px]">Plan Básico</span>
      </div>
      <div class="flex items-center justify-between text-colorTextBlack dark:text-white mt-1.5">
        <span class="text-[10px] font-normal">Capital: 70000</span>
        <span class="text-[10px] font-normal">Rango: 2024-06-13 a 2024-09-13</span>
      </div>
    </header>
    <main class="flex mt-5 gap-6 items-center">
      <div class="flex-1 flex flex-col gap-5">
        <div class=" bg-colorGraySecundary rounded-[10px] py-2.5 px-2.5 flex-1 flex flex-col md:flex-row items-start md:items-center gap-2.5">
          <img :src="inteIcon" alt="Icono de fecha" class="w-[20px] md:w-[35px] rounded-full" />
          <div class="flex flex-col gap-1.5">
            <h3 class="text-[12px] font-medium">Interés</h3>
            <strong class="text-[14px] font-black">
              $ 2000
            </strong>
          </div>
        </div>
      </div>
      <div class="relative flex-1 justify-center w-[140px] lg:w-[180px]">
        <Pie  :data="data" :options="options" />
        <div class="absolute top-[58px] left-[53px] lg:top-[40%] lg:left-[36%]">
          <span class="text-[18px] lg:text-[25px] font-bold text-colorTextBlack dark:text-white">30%</span>
        </div>
      </div>
    </main>
  </section>
</template>

<style scoped>

</style>