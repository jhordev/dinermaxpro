<script setup>
import ReferidosComponent from "@/components/DashboardAdmin/Home/ReferidosComponent.vue";
import TableReferences from "@/components/DashboardAdmin/ReferencesSocios/TableReferences.vue";

const movimientos = [
  {
    nombre: "Juan Pérez",
    planContratado: "Premium",
    fechaRegistro: "2024-12-20",
    ganancias: 2999,
  },
  {
    nombre: "María López",
    planContratado: "Básico",
    fechaRegistro: "2024-12-21",
    ganancias: 1999,
  },
  {
    nombre: "Carlos García",
    planContratado: "Estándar",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "Ana Torres",
    planContratado: "Premium",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "Luis Ramírez",
    planContratado: "Estándar",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "Sofía Martínez",
    planContratado: "Básico",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "David Fernández",
    planContratado: "Premium",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "Laura Gutiérrez",
    planContratado: "Estándar",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "Jorge Herrera",
    planContratado: "Premium",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
  {
    nombre: "Carmen Rojas",
    planContratado: "Básico",
    fechaRegistro: "2024-12-22",
    ganancias: 99,
  },
];
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
    <ReferidosComponent class="h-fit" />
    <TableReferences :datos="movimientos" class="col-span-1 md:col-span-2" />
  </section>
</template>

<style scoped>
</style>