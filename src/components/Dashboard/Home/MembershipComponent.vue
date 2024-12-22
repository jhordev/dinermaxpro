<script setup>
import { ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import dateIcon from '@/assets/img/date.svg';
import graphIcon from '@/assets/img/grafico.svg';

const chartData = {
  series: [1, 60], // Los valores de las series para el gráfico (puedes modificarlos según lo necesites)
  labels: ['Días Recorrido', 'Días Faltantes'], // Las etiquetas que aparecerán en el gráfico
};

const chart = ref(null);

const apexOptions = {
  chart: {
    type: 'donut',
    width: 300,
  },
  colors: ['#7586FF', '#FF49A0'],
  labels: chartData.labels,
  legend: {
    show: false,
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 0,
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};
</script>

<template>
  <section class="rounded-[15px] bg-bgCardLigth py-5 md:py-10 px-5 md:px-[34px] shadow-default dark:bg-bgDashboardDark w-full">
    <h2 class="text-[28px] md:text-[30px] text-colorTextBlack dark:text-white tracking-[3px] font-bold">Membresía activa</h2>
    <span class="text-[14px] md:text-[16px] text-colorGraydark font-bold tracking-[1.6px] mt-1.5">
      Plan Básico de <strong>$ 10000</strong>
    </span>
    <div class="flex flex-col md:flex-row items-center gap-10 md:gap-[100px] mt-8">
      <div class="flex md:flex-col gap-8">
        <div class="bg-colorGraySecundary rounded-[20px] py-4 px-4 flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
          <img :src="dateIcon" alt="Icono de fecha" class="w-10 md:w-auto" />
          <div class="flex flex-col gap-2.5">
            <h3 class="text-[14px] font-medium">Tiempo transcurrido</h3>
            <strong class="text-[18px] font-black">40 días</strong>
          </div>
        </div>
        <div class="bg-colorGraySecundary rounded-[20px] py-4 px-4 flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
          <img :src="graphIcon" alt="Icono de gráfico" class="w-10 md:w-auto" />
          <div class="flex flex-col gap-2.5">
            <h3 class="text-[14px] font-medium">Ganancias generadas</h3>
            <strong class="text-[18px] font-black">$ 10</strong>
          </div>
        </div>
      </div>
      <div class="relative flex flex-row-reverse items-center">
        <VueApexCharts
            type="donut"
            width="300"
            :options="apexOptions"
            :series="chartData.series"
            ref="chart"
        />
        <div class="flex flex-col gap-2.5 items-end md:items-center md:absolute md:top-[29%] md:right-[39%]">
          <span class="text-[14px] font-semibold text-colorGray">Tiempo</span>
          <h3 class="text-[24px] md:text-[30px] font-bold text-colorTextBlack dark:text-white">10%</h3>
          <span class="text-[14px] font-semibold text-colorGraydark">Días</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
