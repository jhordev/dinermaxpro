<script setup>
import {CircleDollarSign, Smartphone} from "lucide-vue-next";
</script>

<template>
    <section class="container flex flex-col gap-[24px] md:gap-[35px] items-center pt-[45px] md:pt-[60px]" id="hero">
      <div class=" flex gap-3 px-[30px] py-[10px] shadow-custom-inset-black rounded-full border-colorBlue">
        <img src="@/assets/img/stars.svg" class="w-[25px] h-[25px]" />
        <span class="text-[14px] md:text-[18px] font-semibold  md:font-medium text-colorTextBlack dark:text-white">Potencial financiero con DinnerMax</span>
      </div>
      <div class="flex flex-col items-center gap-4 ">
          <h1 class="md:max-w-[1240px] text-center text-[34px] md:text-[60px] font-bold text-colorTextBlack dark:text-white">Descubre posibilidades ilimitadas en el mundo de la inversión con DinnerMax</h1>
          <p class="md:max-w-[818px] text-colorPurple dark:text-colorPurpleText  text-[14px] md:text-[18px] text-center font-semibold md:font-normal">Adéntrate en el universo de DinnerMax, la plataforma de inversión que transforma la manera en que gestionas tu dinero. Aprovecha cada oportunidad con nuestra avanzada tecnología, asesoría experta y estrategias optimizadas para maximizar tu éxito financiero.</p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3 md:gap-6">
        <div class="flex flex-2 items-center">
          <img src="@/assets/img/item1.svg" class="w-[28px] h-[28px]" />
          <span class="font-semibold text-colorTextBlack dark:text-white text-[14px]">Inversión Rápida</span>
        </div>
        <div class="flex flex-2 items-center">
          <img src="@/assets/img/item2.svg" class="w-[28px] h-[28px]" />
          <span class="font-semibold text-colorTextBlack dark:text-white text-[14px]">Seguridad y Fiabilidad</span>
        </div>
        <div class="flex flex-2 items-center">
          <img src="@/assets/img/item3.svg" class="w-[28px] h-[28px]" />
          <span class="font-semibold text-colorTextBlack dark:text-white text-[14px]">Actualizado al Mercado</span>
        </div>
      </div>
      <div class="flex flex-col items-center gap-4 md:flex-row md:gap-6">
        <RouterLink to="/register" class=" container-btn flex items-center gap-3 py-[10px] px-4 md:py-4 md:px-7 rounded-full text-white font-medium">
          <CircleDollarSign />
          Empezar a invertir
        </RouterLink>
        <a href="https://wa.me/593963620095?text=Hola%2C%20DinnerMax" target="_blank" class="w-fit container-btn-contact flex gap-3 py-[10px] px-4 md:py-4 md:px-7 border border-colorPurple dark:border-none  rounded-full text-colorTextBlack dark:text-white font-medium">
          <Smartphone />
          Contáctanos
        </a>
      </div>
    </section>
</template>

<style scoped>
.container-btn{
  background: radial-gradient(70.71% 70.71% at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.00) 100%), #0A7CFF;
  box-shadow: 1px 1px 2px 0px rgba(255, 255, 255, 0.24) inset, 0px 1px 3px 0px rgba(10, 124, 255, 0.24), 0px 2px 6px 0px rgba(10, 124, 255, 0.24), 0px 4px 8px 0px rgba(10, 124, 255, 0.12), 0px 16px 32px -8px rgba(10, 124, 255, 0.48);
}
.container-btn-contact{
  border-radius: 48px;
  background: radial-gradient(70.71% 70.71% at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.04);
  box-shadow: 0px 8px 40px -20px rgba(255, 255, 255, 0.20), 1px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 0px 0px 0px 1px rgba(255, 255, 255, 0.06) inset;
}
</style>