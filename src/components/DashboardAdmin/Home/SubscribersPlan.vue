<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['Plan Básico', 'Plan Estandar', 'Plan Pro'],
  datasets: [
    {
      label: 'Sales',
      data: [12, 20, 35],
      backgroundColor: ['#9F9FF8', '#96E2D6', '#92BFFF'],
    },
  ],
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
}

</script>

<template>
  <CardLayout>
    <h3 class="text-[18px] text-colorTextBlack font-semibold dark:text-white">Suscriptores por plan</h3>
    <Bar
        class="mt-4"
        id="my-chart-id"
        :options="chartOptions"
        :data="chartData"
    />
  </CardLayout>
</template>

<style scoped>

</style>