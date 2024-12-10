<script setup>

import Button from "@/components/Inicio/Shared/Button.vue";
</script>

<template>
  <section class="container-section pt-[45px] md:pt-[105px]">
    <h2 class="text-[32px] text-colorTextBlack dark:text-white font-extrabold max-w-48 md:max-w-[200px] md:text-[100px] md:leading-[100px]">Sobre DinerMax</h2>
    <div class="flex flex-col-reverse gap-4 mt-4 md:flex-row md:mt-[60px] md:gap-[122px]">
      <img src="@/assets/img/wallet.png"/>
      <div class="flex flex-col gap-8 items-center md:items-start md:gap-[30px]">
        <p class="text-[14px] dark:text-colorGray font-normal md:text-[18px] md:leading-[27px]">
          Dinner Max es una plataforma de inversión accesible y segura diseñada para ayudarte a hacer crecer tu dinero. Con opciones de planes ajustados a tus metas, obtienes retornos diarios y la flexibilidad de retirar tus ganancias según tus necesidades. Además, cumplimos con regulaciones estrictas para asegurar tus fondos y brindarte soporte personalizado en cada paso, ofreciéndote información de mercado y asistencia en todo momento. Dinner Max es tu aliado para maximizar tus inversiones y alcanzar tus objetivos financieros de manera sencilla.
        </p>
        <Button label="Iniciar a invertir" to="/register" class="w-fit px-10"/>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>