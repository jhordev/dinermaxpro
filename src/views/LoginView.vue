<script setup>
import { ref, onMounted, watch } from 'vue';
import { Eye, EyeOff, Loader2, CircleUserRound, KeyRound } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth_service';
import DialogValidation from '@/dialogs/DialogValidation.vue';
import { logError, logInfo } from '@/utils/logger.js';
import { useDarkModeStore } from '@/stores/darkMode.js';
useDarkModeStore();

const router = useRouter();
const passwordVisible = ref(false);
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const showValidationDialog = ref(false);
const isSubmitting = ref(false);
const isDarkMode = ref(true);

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting.value) return;

  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor complete todos los campos';
    return;
  }

  isSubmitting.value = true;
  loading.value = true;
  errorMessage.value = '';

  try {
    // Primero intentamos autenticar al usuario
    const result = await authService.loginUser(email.value, password.value);

    if (result.success) {
      logInfo(`Credenciales verificadas para: ${email.value}`);
      // Inmediatamente enviamos el código de verificación
      const verificationResult = await authService.sendVerificationCode(email.value);

      if (verificationResult.success) {
        showValidationDialog.value = true;
      } else {
        errorMessage.value = verificationResult.error;
        // Si falla el envío del código, cerramos la sesión
        await authService.logout();
      }
    } else {
      errorMessage.value = result.error;
    }
  } catch (error) {
    logError(`Error en login: ${error.message}`);
    errorMessage.value = 'Error al iniciar sesión';
    await authService.logout();
  } finally {
    loading.value = false;
    isSubmitting.value = false;
  }
};
</script>

<template>
  <main class="relative h-[100vh] overflow-hidden flex flex-col gap-5 md:justify-center items-center ">
    <!-- Video de fondo -->
    <video autoplay muted loop class="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover">
      <source src="@/assets/fondo.mp4" type="video/mp4" />
      Tu navegador no soporta videos HTML5.
    </video>

    <!-- Contenido sobre el video -->
    <div class="relative container-form z-10 w-full flex flex-col items-center">
      <router-link to="/" class="w-[150px] md:w-[239px] mt-16 md:mt-0">
        <img src="@/assets/img/logotipo.png" alt="Logo">
      </router-link>

      <form @submit="handleSubmit" class="px-4 md:px-0 w-auto md:w-[500px] flex flex-col">
        <h1 class="font-bold text-[26px] md:text-[30px] text-white text-center md:text-left">Iniciar Sesión</h1>
        <div class="mt-5 border  border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[52px] md:h-[64px] flex ">
          <label for="user" class="font-bold h-full  text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-tl-[20px] rounded-bl-[20px] flex-[0.1]">
            <CircleUserRound class="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" />
          </label>
          <input
              v-model="email"
              type="email"
              id="user"
              placeholder="Correo"
              autocomplete="off"
              class="text-[14px] pl-3  md:text-[20px] bg-transparent text-white focus:text-colorTextBlack focus:bg-gray-100 outline-none rounded-tr-[20px] rounded-br-[20px]  w-full flex-1"
          />
        </div>
        <div class="mt-10  border border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[52px] md:h-[64px] flex items-center relative">
          <label for="password" class="font-bold h-full  text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-tl-[20px] rounded-bl-[20px] flex-[0.1]">
            <KeyRound class="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" />
          </label>
          <input
              v-model="password"
              :type="passwordVisible ? 'text' : 'password'"
              id="password"
              placeholder="Contraseña"
              autocomplete="off"
              class="pr-16 text-[14px] pl-3  md:text-[20px] h-full bg-transparent text-white focus:text-colorTextBlack focus:bg-gray-100 outline-none rounded-tr-[20px] rounded-br-[20px]  w-full flex-1"
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

        <p v-if="errorMessage" class="text-red-500 text-sm mt-2 text-center">
          {{ errorMessage }}
        </p>

        <a href="#" class="link text-white text-end mt-4 text-[14px] mr-3">¿Olvidaste tu contraseña?</a>
        <div class="w-full flex-col items-center justify-center">
          <div class="w-full mt-10 flex justify-center">
            <button
                type="submit"
                :disabled="loading || isSubmitting"
                class="button dark:text-white bg-colorCeleste h-[52px] md:h-[65px] font-bold text-[18px] md:text-[20px] rounded-[20px] shadow-custom-purple cursor-pointer w-full md:max-w-[338px] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading" class="animate-spin mr-2 h-5 w-5" />
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </div>
          <p class="text-center mt-6 text-white text-[14px]">
            ¿No tiene una cuenta en DinnerMax?  <router-link to="/register" class="font-bold">Regístrate </router-link>
          </p>
        </div>
      </form>

      <DialogValidation
          v-if="showValidationDialog"
          :email="email"
          :isLogin="true"
          @close="showValidationDialog = false"
      />
    </div>
  </main>
</template>

<style scoped>
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

.relative {
  position: relative;
  z-index: 10;
}
</style>