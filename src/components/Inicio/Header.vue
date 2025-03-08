<script setup>
import { Menu, X } from "lucide-vue-next";
import Button from "@/components/Inicio/Shared/Button.vue";
import DarkModeSwircher from "@/components/Inicio/Shared/DarkModeSwircher.vue";
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.classList.toggle('overflow-hidden', isMenuOpen.value);
};

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
  <header class="flex justify-between items-center relative pt-6 md:pt-10 " id="header">
    <!-- Logo -->
    <div class="flex items-center gap-2  md:gap-2 md:w-[266.69px]">
      <img src="/logonew.png" class="w-9 md:w-14 block dark:hidden" />
      <img src="/logowhite.png" class="w-9 md:w-14 hidden dark:block" />
      <span class="font-bold text-xl md:text-2xl dark:text-white">DinnerMax</span>
      <DarkModeSwircher class="block ml-4" />
    </div>

    <!-- Navigation Menu -->
    <nav :class="['container-nav-movile fixed inset-0 top-[72px] bg-white dark:bg-colorBgBlack z-10 flex flex-col items-center gap-6 p-5 shadow-md transition-transform duration-300', isMenuOpen ? 'translate-x-0' : 'translate-x-full']">
      <router-link @click="toggleMenu" to="/" class="link dark:text-white ">Home</router-link>
      <a @click="scrollToSection('about')" class="link dark:text-white ">¿Quiénes Somos?</a>
      <a @click="scrollToSection('plans')" class="link dark:text-white ">Planes</a>
      <a @click="scrollToSection('contact')" class="link dark:text-white ">Contacto</a>
    </nav>

    <!-- Desktop Navigation -->
    <nav class="hidden sm:flex gap-8 items-center container-nav">
      <router-link to="/" class="link dark:text-white">Home</router-link>
      <a @click="scrollToSection('about')" class="link dark:text-white">¿Quiénes Somos?</a>
      <a @click="scrollToSection('plans')" class="link dark:text-white">Planes</a>
      <a @click="scrollToSection('contact')" class="link dark:text-white">Contacto</a>
    </nav>

    <!-- Buttons -->
    <div class="flex gap-5 items-center">
      <router-link to="/login" class="dark:text-white text-[14px] md:text-[18px] hidden sm:flex">Iniciar Sesión</router-link>
      <Button label="Iniciar Sesión" to="/login" class="flex sm:hidden"/>
      <Button label="Registrarse" to="/register" class="hidden sm:flex" />
    </div>
    <button @click="toggleMenu" class="sm:hidden p-2">
      <Menu v-if="!isMenuOpen" class="w-6 h-6 dark:text-white" />
      <X v-else class="w-6 h-6 dark:text-white" />
    </button>


  </header>
</template>

<style scoped>
header {
  width: 98%;
  max-width: 1300px;
  margin: 0 auto;
}

.container-nav{
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  padding: 12px 16px;
}

.link {
  font-size: 16px;
  font-weight: normal;
  line-height: 28px;
  transition: color 0.3s;
  cursor: pointer;
}

.link:hover {
  color: #007bff;
}
.container-nav-movile{
  align-items: end;
}
.container-nav-movile a{
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  padding: 15px 5px;
}
</style>