<script setup>
import {ArrowRight} from "lucide-vue-next";
</script>

<template>
  <section class="container-section pt-[45px] md:pt-[75px] flex justify-center">
   <div class="flex flex-col md:max-w-[780px] ">
     <h2 class="text-center text-[32px] md:text-[50px]  leading-10 md:leading-[140%] text-colorTextBlack dark:text-white font-black">
       Recibe las últimas noticias
     </h2>
     <p class="text-[14px] font-semibold text-center mt-4 text-colorTextBlack dark:text-colorGray">
       Recibe noticias exclusivas y mantente al día. <br> ¡Suscríbete ahora!
     </p>
     <form class="md:mx-[150px] md:mt-8 mt-4 px-5 bg-transparent border border-colorBgBlack dark:border-white rounded-[10px] flex items-center h-[56px] mx-[25px]">
       <input class="outline-none text-colorTextBlack dark:text-white text-[14px] h-full w-full bg-transparent" placeholder="Dirección Email"/>
       <button><ArrowRight class="text-colorGray hover:text-colorTextBlack dark:text-white transition-colors duration-300 ease-in-out" /></button>
     </form>
   </div>
  </section>
</template>

<style scoped>

</style>