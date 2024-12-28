<script setup>

import Card from "@/components/DashboardAdmin/Home/CardsResumen/Card.vue";
import iconUsers from '@/assets/img/icons/admin/resumen/users.svg'
import iconFunds from '@/assets/img/icons/admin/resumen/fondos.svg'
import iconFundsMenus from '@/assets/img/icons/admin/resumen/fondosres.svg'
import graficDash from '@/assets/img/icons/admin/resumen/graf.svg'

const cardsData = [
  {
    title: "Total de Usuarios",
    value: "40,689",
    percentage: 8.5,
    icon: iconUsers,
  },
  {
    title: "Fondos",
    value: "6,000,000",
    percentage: 8.5,
    icon: iconFunds,
  },
  {
    title: "Fondos retirados",
    value: "30,000",
    percentage: 8.5,
    icon: iconFundsMenus,
  },
  {
    title: "Total Fondos",
    value: "200,000",
    percentage: -8.5,
    icon: graficDash,
  },
];

</script>

<template>
  <section class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-8">
    <Card
        v-for="(card, index) in cardsData"
        :key="index"
        :title="card.title"
        :value="card.value"
        :percentage="card.percentage"
        :icon="card.icon"
    />
  </section>
</template>

<style scoped>

</style>