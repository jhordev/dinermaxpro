<script setup>
import CardActivo from "@/components/Dashboard/Shared/CardActivo.vue";
import Cripto from '@/assets/img/cripto.svg';
const cryptoData = [
  {
    id: 1,
    imageSrc: Cripto,
    name: 'BTC',
    amount: '$34,500.50',
    percentage: '1.2%',
    isPositive: true,
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 2,
    imageSrc: Cripto,
    name: 'ETH',
    amount: '$2,350.75',
    percentage: '-0.8%',
    isPositive: false,
    textColor: 'text-red-600 dark:text-red-400',
  },
  {
    id: 3,
    imageSrc: Cripto,
    name: 'LTC',
    amount: '$190.10',
    percentage: '0.5%',
    isPositive: true,
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 4,
    imageSrc: Cripto,
    name: 'XRP',
    amount: '$1.25',
    percentage: '-1.1%',
    isPositive: false,
    textColor: 'text-red-600 dark:text-red-400',
  },
  {
    id: 5,
    imageSrc: Cripto,
    name: 'DOGE',
    amount: '$0.075',
    percentage: '2.3%',
    isPositive: true,
    textColor: 'text-green-600 dark:text-green-400',
  },
];

</script>

<template>
  <section>
    <h3 class="text-[18px] text-colorTextBlack font-semibold dark:text-white">Activos</h3>
    <div class="mt-5 grid grid-cols-2 sm:grid-cols-3  md:grid-cols-5 gap-x-2 gap-y-2 md:gap-x-6 md:gap-y-5">
      <CardActivo
          v-for="crypto in cryptoData"
          :key="crypto.id"
          :imageSrc="crypto.imageSrc"
          :name="crypto.name"
          :amount="crypto.amount"
          :percentage="crypto.percentage"
          :isPositive="crypto.isPositive"
          :textColor="crypto.textColor"
      />
    </div>
  </section>
</template>

<style scoped>

</style>