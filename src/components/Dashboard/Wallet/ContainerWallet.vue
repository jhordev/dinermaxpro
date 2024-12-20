<script setup>
import FormRetirar from "@/components/Dashboard/Wallet/FormRetirar.vue";
import TableMovimientos from "@/components/Dashboard/Wallet/TableMovimientos.vue";
</script>

<template>
  <section class="flex flex-col md:flex-row gap-[24px]">
    <FormRetirar class="flex-[0.4] h-fit"/>
    <TableMovimientos class="flex-1"/>
  </section>
</template>

<style scoped>

</style>