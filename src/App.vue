<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>

  <header>
    <img alt="Vue logo" class="logo" src="@/assets/img/isotipo.png" width="150" height="150" />

    <div class="wrapper">
      <HelloWorld msg="DINERMAX" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />

</template>

<style scoped>

</style>
