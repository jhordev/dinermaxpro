<script setup>
import { ref } from 'vue';
import CardLayout from "@/layouts/CardLayout.vue";

const brandData = ref([
  {
    fecha: '2024-12-01',
    transaccion: 'TXN001',
    operacion: 'Depósito',
    monto: 1500.0,
  },
  {
    fecha: '2024-12-02',
    transaccion: 'TXN002',
    operacion: 'Retiro',
    monto: 500.0,
  },
  {
    fecha: '2024-12-03',
    transaccion: 'TXN003',
    operacion: 'Transferencia',
    monto: 2000.0,
  },
  {
    fecha: '2024-12-04',
    transaccion: 'TXN004',
    operacion: 'Pago de servicio',
    monto: 750.0,
  },
  {
    fecha: '2024-12-05',
    transaccion: 'TXN005',
    operacion: 'Depósito',
    monto: 1800.0,
  },
]);
</script>

<template>
  <CardLayout>
    <header class="flex justify-between items-center mb-4">
      <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
        Últimos movimientos
      </h2>
      <router-link
          to="/movimientos"
          class="text-[16px] text-colorGraydark tracking-[1.6px] font-bold hover:underline"
      >
        Ver todo
      </router-link>
    </header>

    <div class="overflow-x-auto mt-5">
      <table class="w-full table-auto border-collapse text-left">
        <thead>
        <tr class="bg-transparent  ">
          <th class="p-4 text-sm font-medium uppercase text-black dark:text-white">Fecha</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Transacción</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Operación</th>
          <th class="p-4 text-center text-sm font-medium uppercase text-black dark:text-white">Monto</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(brand, key) in brandData"
            :key="key"
            :class="key % 2 === 0 ? 'bg-transparent' : 'bg-bgf3 dark:bg-colorfila'"
        >
          <td class="p-4 text-[14px] font-normal text-colorTextBlack dark:text-white">{{ brand.fecha }}</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white ">{{ brand.transaccion }}K</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white">${{ brand.operacion }}</td>
          <td class="p-4 text-[14px] font-normal text-center text-colorTextBlack dark:text-white ">{{ brand.monto }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </CardLayout>
</template>

<style scoped>
/* Personaliza tus estilos aquí si es necesario */
</style>
