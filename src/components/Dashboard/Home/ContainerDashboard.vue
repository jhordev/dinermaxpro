<script setup>

import ReferidosComponent from "@/components/Dashboard/Home/ReferidosComponent.vue";
import MembershipComponent from "@/components/Dashboard/Home/MembershipComponent.vue";
import TotalComponent from "@/components/Dashboard/Home/TotalComponent.vue";
import MovementsComponent from "@/components/Dashboard/Home/MovementsComponent.vue";
import ProfileCardComponent from "@/components/Dashboard/Home/ProfileCardComponent.vue";
import ActivosComponent from "@/components/Dashboard/Home/ActivosComponent.vue";
</script>

<template>
  <ActivosComponent/>

  <main class="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,400px)] mt-5 md:mt-10 gap-10">
    <section class="flex flex-col gap-10">
      <TotalComponent
          totalAmount="345,045.31"
          totalInUSD="345,045.31 USD"
      />
      <MembershipComponent/>
      <MovementsComponent/>
    </section>
    <section class="flex flex-col gap-10">
      <ProfileCardComponent/>
      <ReferidosComponent/>
    </section>
  </main>
</template>

<style scoped>

</style>