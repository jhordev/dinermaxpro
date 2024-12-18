<script setup>
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';

const passwordVisible = ref(false);

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};
</script>

<template>
  <main class="bg-custom-gradient dark:bg-custom-gradient-dark h-[100vh] flex flex-col gap-5 md:justify-center items-center">
    <router-link to="/" class=" w-[150px] md:w-[239px] mt-16 md:mt-0">
      <img src="@/assets/img/logotipo.png" alt="Logo">
    </router-link>



    <form class="px-4 md:px-0 w-auto md:w-[500px] flex flex-col">
      <h1 class="font-bold text-[26px] md:text-[30px] text-colorTextBlack dark:text-white text-center md:text-left">Iniciar Sesión</h1>
      <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[64px] flex gap-2 md:gap-5">
        <label for="user" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-[20px] flex-[0.4]">
          Usuario
        </label>
        <input
            type="email"
            id="user"
            placeholder="Usuario"
            autocomplete="off"
            class="text-[14px] md:text-[20px] bg-transparent outline-none rounded-[20px] text-colorTextBlack dark:text-white w-full flex-1"
        />
      </div>
      <div class="mt-10 border  border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[64px] flex gap-2 md:gap-5 items-center relative">
        <label for="password" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-[20px] flex-[0.4]">
          Contraseña
        </label>
        <input
            :type="passwordVisible ? 'text' : 'password'"
            id="password"
            placeholder="Contraseña"
            autocomplete="off"
            class=" pr-16 text-[14px] md:text-[20px] h-full bg-transparent outline-none rounded-[20px] text-colorTextBlack dark:text-white w-full flex-1"
        />
        <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute right-5 cursor-pointer text-colorGray dark:text-white"
        >
          <Eye v-if="passwordVisible" class="w-[24px] h-[24px]" />
          <EyeOff v-else class="w-[24px] h-[24px]" />
        </button>
      </div>
      <a href="#" class="link dark:text-white text-end mt-4 text-[14px] mr-3">¿Olvidaste tu contraseña?</a>
      <div class="w-full flex-col items-center justify-center">
        <router-link to="/dashboard" class="w-full mt-10 flex justify-center">
          <input
              type="submit"
              value="Iniciar Sesión"
              class="button dark:text-white  bg-colorCeleste h-[65px] font-bold text-[18px] md:text-[20px] rounded-[20px] shadow-custom-purple cursor-pointer w-full md:max-w-[338px] text-white"
          />
        </router-link>
        <p class="text-center mt-6 text-colorTextBlack dark:text-white text-[14px]">
          ¿No tiene una cuenta en DinnerMax?  <router-link to="/register" class="font-bold">Regístrate </router-link>
        </p>

      </div>
    </form>

    <img src="@/assets/img/arrow-left.png" class="absolute top-0 right-0 w-36 md:w-auto" alt="Arrow Left">
    <img src="@/assets/img/arrow-rigth.png" class="absolute top-0 left-0 w-36 md:w-auto" alt="Arrow Right">
  </main>
</template>

<style scoped>
</style>
