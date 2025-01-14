<script setup>
import {Instagram, Facebook} from 'lucide-vue-next'
import {ref} from "vue";

const isMenuOpen = ref(false);
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
  isMenuOpen.value = false;
  document.body.classList.remove('overflow-hidden');
};
</script>

<template>
    <footer class="pt-[45px] md:pt-[100px] container-section ">
      <div class="py-5 md:py-6 border-t border-gray-400 dark:border-colorBorder flex justify-center ">
       <div class="max-w-[956px] flex flex-col md:flex-row md:gap-[200px]">
         <div class="flex flex-col gap-[15px] md:max-w-[380px] ">
           <h2 class="text-[30px] font-bold text-colorTextBlack dark:text-white">DinnerMax</h2>
           <div class="flex flex-col gap-[10px]">
             <p class="dark:text-white text-colorTextBlack text-3 font-normal">DinnerMax facilita el crecimiento de tu dinero con planes ajustados a tus metas, retornos diarios y retiros flexibles, brindándote soporte personalizado en cada paso.</p>
             <p class="dark:text-white text-colorTextBlack text-3 font-normal">Regístrate para recibir las últimas novedades, consejos de inversión y más sobre cómo alcanzar tus objetivos financieros con DinnerMax.</p>
           </div>
           <nav class="flex gap-4">
             <a href="" class="dark:text-colorGray text-gray-500"><Facebook /></a>
             <a href="" class="dark:text-colorGray text-gray-500"><Instagram /></a>
             <a href="" class="dark:fill-colorGray fill-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="current">
                 <mask id="mask0_32_971" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
                   <path d="M0 0.292236H25V24.1811H0V0.292236Z" fill="white"/>
                 </mask>
                 <g mask="url(#mask0_32_971)">
                   <path d="M19.6875 1.41162H23.5214L15.1464 10.5815L25 23.0618H17.2857L11.2393 15.4941L4.32857 23.0618H0.491071L9.44821 13.2503L0 1.41333H7.91071L13.3679 8.32916L19.6875 1.41162ZM18.3393 20.864H20.4643L6.75 3.49507H4.47143L18.3393 20.864Z" fill="current"/>
                 </g>
               </svg>
             </a>
           </nav>
           <p class="mt-[10px] hidden md:flex text-gray-600 dark:text-gray-400 text-left text-3">&copy 2024 DinnerMax, inversión segura</p>
         </div>
         <div class="mt-5 grid grid-cols-2 md:gap-[100px]">
           <div class="flex flex-col gap-[10px] md:gap-[24px] text-colorTextBlack dark:text-white">
             <h3 class="text-[18px] font-semibold">Estructura</h3>
             <a @click="scrollToSection('header')" class="cursor-pointer">Home</a>
             <a @click="scrollToSection('about')" class="cursor-pointer">¿Quiénes somos?</a>
             <a @click="scrollToSection('plans')" class="cursor-pointer">Planes</a>
             <a @click="scrollToSection('simulator')" class="cursor-pointer">Calcular Ganancias</a>
             <a @click="scrollToSection('contact')" class="cursor-pointer">Contácto</a>
           </div>
           <div class="flex flex-col gap-[10px] md:gap-6 text-colorTextBlack dark:text-white">
             <h3 class="text-[18px] font-semibold">Planes</h3>
             <a href="">Plan Básico</a>
             <a href="">Plan Stándar</a>
             <a href="">Plan Pro</a>
           </div>
         </div>
       </div>
      </div>
      <p class="block md:hidden text-gray-600 dark:text-gray-400 text-center text-3">&copy 2025 DinnerMax, inversión segura</p>
    </footer>
</template>

<style scoped>

</style>