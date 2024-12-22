<script setup>
import FormRetirar from "@/components/Dashboard/Wallet/FormRetirar.vue";
import TableMovimientos from "@/components/Dashboard/Wallet/TableMovimientos.vue";


const movimientos = [
  { fecha: "2024-12-20", transaccion: "Apple MacBook Pro", operacion: "Compra", monto: 2999 },
  { fecha: "2024-12-21", transaccion: "Microsoft Surface Pro", operacion: "Venta", monto: 1999 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
  { fecha: "2024-12-22", transaccion: "Magic Mouse 2", operacion: "Compra", monto: 99 },
];
</script>

<template>
  <section class="flex flex-col md:flex-row gap-[24px]">
    <FormRetirar class="flex-[0.4] h-fit" />
    <TableMovimientos :datos="movimientos" class="flex-1" />
  </section>
</template>

<style scoped>
/* Agregar estilos si es necesario */
</style>
