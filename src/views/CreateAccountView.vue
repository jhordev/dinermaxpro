<script setup>
import { ref, onBeforeMount } from 'vue';
import {CircleUserRound, Eye, EyeOff, KeyRound, Loader2, Mail} from 'lucide-vue-next';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/auth_service';
import { referralService } from '@/services/referral_service';
import DialogValidation from '@/dialogs/DialogValidation.vue';
import { logError, logInfo } from '@/utils/logger.js';
import { useDarkModeStore } from '@/stores/darkMode.js';

useDarkModeStore();

const router = useRouter();
const route = useRoute();
const passwordVisible = ref(false);
const nombre = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const showValidationDialog = ref(false);
const referralCode = ref(null);
const socioId = ref(null);
const referralName = ref('');
const loadingReferral = ref(false);

const loadReferralData = async (refCode) => {
  loadingReferral.value = true;
  try {
    const referralInfo = await Promise.race([
      referralService.getReferralInfoFromCode(refCode),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);

    if (referralInfo) {
      socioId.value = referralInfo.socioId;
      referralName.value = referralInfo.nombre;
      logInfo(`Código de referido detectado: ${refCode}, Nombre: ${referralInfo.nombre}`);
    } else {
      logInfo(`Código de referido inválido: ${refCode}`);
    }
  } catch (error) {
    logError(`Error al obtener información del referido: ${error.message}`);
  } finally {
    loadingReferral.value = false;
  }
};

onBeforeMount(() => {
  const refCode = route.query.ref;
  if (refCode) {
    referralCode.value = refCode;
    loadReferralData(refCode);
  }
});

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const validateForm = () => {
  if (!nombre.value.trim()) {
    errorMessage.value = 'El nombre es requerido';
    return false;
  }
  if (!email.value.trim()) {
    errorMessage.value = 'El correo es requerido';
    return false;
  }
  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres';
    return false;
  }
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await authService.initializeRegistration(
        email.value,
        password.value,
        nombre.value,
        referralCode.value,
        socioId.value
    );

    if (result.success) {
      showValidationDialog.value = true;
    } else {
      errorMessage.value = result.error;
    }
  } catch (error) {
    logError(`Error en registro: ${error.message}`);
    errorMessage.value = 'Error al iniciar el registro';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="container-main relative h-[100vh] overflow-hidden flex flex-col gap-5 md:justify-center items-center">

    <div class="container-form relative py-6 z-10 w-full flex flex-col items-center">
      <router-link to="/" class="w-[150px] md:w-[239px] mt-16 md:mt-0">
        <img src="@/assets/img/logotipo.png" alt="Logo">
      </router-link>
      <form @submit="handleSubmit" class="px-4 md:px-0 w-auto md:w-[500px] flex flex-col">
        <h1 class="font-bold text-[26px] md:text-[30px] text-white text-center md:text-left">
          Registrate para iniciar
        </h1>



        <div   class="mt-3 mb-2 flex items-center gap-2 w-full ">

          <div class="mt-5 w-full border border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[52px] md:h-[64px] flex gap-2 md:gap-5">
            <label for="nombre" class="font-bold h-full text-[14px] md:text-[20px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-tl-[20px] rounded-bl-[20px] flex-[0.1]">
             <img src="@/assets/img/iconreferido.png" class=" md:w-[40px] md:h-[40px]" alt="icon-ref">
            </label>
            <div v-if="loadingReferral" class="mt-2 mb-3 flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-colorCeleste border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div v-else-if="referralName"  class="text-[18px] flex items-center font-bold md:text-[22px] bg-transparent outline-none rounded-[20px] text-white w-full flex-1">
              {{ referralName }}
            </div>
            <div v-else="referralName"  class="text-[18px] flex items-center font-bold md:text-[22px] bg-transparent outline-none rounded-[20px] text-white w-full flex-1">
              DinnerMax
            </div>
          </div>
        </div>

        <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px]  h-[52px] md:h-[64px] flex">
          <label for="nombre" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-tl-[20px] rounded-bl-[20px] flex-[0.1]">
            <CircleUserRound class="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" />
          </label>
          <input
              type="text"
              id="nombre"
              v-model="nombre"
              placeholder="Nombre completo"
              autocomplete="off"
              class="text-[14px] pl-3  md:text-[20px] bg-transparent text-white focus:text-colorTextBlack focus:bg-gray-100 outline-none rounded-tr-[20px] rounded-br-[20px]  w-full flex-1"
          />
        </div>

        <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px]  h-[52px] md:h-[64px]  flex ">
          <label for="user" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-tl-[20px] rounded-bl-[20px] flex-[0.1]">
            <Mail class="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" />
          </label>
          <input
              type="email"
              id="user"
              v-model="email"
              placeholder="Correo"
              autocomplete="off"
              class="text-[14px] pl-3  md:text-[20px] bg-transparent text-white focus:text-colorTextBlack focus:bg-gray-100 outline-none rounded-tr-[20px] rounded-br-[20px]  w-full flex-1"
          />
        </div>

        <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px]  h-[52px] md:h-[64px] flex  items-center relative">
          <label for="password" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-tl-[20px] rounded-bl-[20px] flex-[0.1]">
            <KeyRound class="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" />
          </label>
          <input
              :type="passwordVisible ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Contraseña"
              autocomplete="off"
              class="pr-16 pl-3  text-[14px] md:text-[20px] h-full bg-transparent focus:bg-gray-100 outline-none rounded-tr-[20px] rounded-br-[20px] text-white focus:text-colorTextBlack w-full flex-1"
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

        <p v-if="errorMessage" class="mt-2 text-red-500 text-sm text-center">
          {{ errorMessage }}
        </p>

        <div class="w-full flex-col items-center justify-center">
          <div class="mt-10 flex justify-center">
            <button
                type="submit"
                :disabled="loading"
                class="button dark:text-white bg-colorCeleste h-[52px] md:h-[65px] font-bold text-[18px] md:text-[20px] rounded-[20px] shadow-custom-purple cursor-pointer w-full md:max-w-[338px] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading" class="animate-spin mr-2 h-5 w-5" />
              {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
          </div>
          <p class="text-center mt-6 text-white text-[14px]">
            ¿Ya tienes una cuenta? <router-link to="/login" class="font-bold hover:underline">Inicio de Sesión</router-link>
          </p>
        </div>
      </form>
    </div>


    <DialogValidation
        v-if="showValidationDialog"
        :email="email"
        @close="showValidationDialog = false"
    />
  </main>
</template>

<style scoped>
.container-main{
  background-image: url("@/assets/fondo.gif");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.container-form{
  overflow-y: auto;
}
video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: 0;
}

/* Asegúrate de que el contenido esté por encima del video */
.relative {
  position: relative;
  z-index: 10;
}
</style>