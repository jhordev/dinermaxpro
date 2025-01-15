<script setup>
import { ref, onMounted } from 'vue';
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next';
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

onMounted(async () => {
  const refCode = route.query.ref;
  if (refCode) {
    referralCode.value = refCode;
    try {
      const referralInfo = await referralService.getReferralInfoFromCode(refCode);
      if (referralInfo) {
        socioId.value = referralInfo.socioId;
        referralName.value = referralInfo.nombre;
        logInfo(`Código de referido detectado: ${refCode}, Nombre: ${referralInfo.nombre}`);
      } else {
        logInfo(`Código de referido inválido: ${refCode}`);
      }
    } catch (error) {
      logError(`Error al obtener información del referido: ${error.message}`);
    }
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
  <main class="bg-custom-gradient dark:bg-custom-gradient-dark min-h-screen flex flex-col gap-5 md:justify-center items-center py-8">
    <router-link to="/" class="w-[150px] md:w-[239px] mt-16 md:mt-0">
      <img src="@/assets/img/logotipo.png" alt="Logo">
    </router-link>

    <form @submit="handleSubmit" class="px-4 md:px-0 w-auto md:w-[500px] flex flex-col">
      <h1 class="font-bold text-[26px] md:text-[30px] text-colorTextBlack dark:text-white text-center md:text-left">
        Registrate para iniciar
      </h1>

      <!-- Texto de Referido -->
      <div v-if="referralName" class="mt-2 mb-3 flex items-center justify-center gap-2">
        <span class="text-colorGray dark:text-colorCelesteligth text-sm">
          Invitado por <span class="font-semibold text-colorTextBlack dark:text-white">{{ referralName }}</span>
        </span>
      </div>

      <!-- Campo Nombre -->
      <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[64px] flex gap-2 md:gap-5">
        <label for="nombre" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-[20px] flex-[0.4]">
          Nombre
        </label>
        <input
            type="text"
            id="nombre"
            v-model="nombre"
            placeholder="Nombre completo"
            autocomplete="off"
            class="text-[14px] md:text-[20px] bg-transparent outline-none rounded-[20px] text-colorTextBlack dark:text-white w-full flex-1"
        />
      </div>

      <!-- Campo Correo -->
      <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[64px] flex gap-2 md:gap-5">
        <label for="user" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-[20px] flex-[0.4]">
          Correo
        </label>
        <input
            type="email"
            id="user"
            v-model="email"
            placeholder="Correo"
            autocomplete="off"
            class="text-[14px] md:text-[20px] bg-transparent outline-none rounded-[20px] text-colorTextBlack dark:text-white w-full flex-1"
        />
      </div>

      <!-- Campo Contraseña -->
      <div class="mt-5 border border-colorblueblack dark:border-colorCelesteligth rounded-[20px] h-[64px] flex gap-2 md:gap-5 items-center relative">
        <label for="password" class="font-bold h-full text-[16px] md:text-[24px] text-white px-5 flex justify-center items-center bg-custom-gradient-blue rounded-[20px] flex-[0.4]">
          Contraseña
        </label>
        <input
            :type="passwordVisible ? 'text' : 'password'"
            id="password"
            v-model="password"
            placeholder="Contraseña"
            autocomplete="off"
            class="pr-16 text-[14px] md:text-[20px] h-full bg-transparent outline-none rounded-[20px] text-colorTextBlack dark:text-white w-full flex-1"
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

      <!-- Mensaje de error -->
      <p v-if="errorMessage" class="mt-2 text-red-500 text-sm text-center">
        {{ errorMessage }}
      </p>

      <div class="w-full flex-col items-center justify-center">
        <div class="mt-10 flex justify-center">
          <button
              type="submit"
              :disabled="loading"
              class="button dark:text-white bg-colorCeleste h-[65px] font-bold text-[18px] md:text-[20px] rounded-[20px] shadow-custom-purple cursor-pointer w-full md:max-w-[338px] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="animate-spin mr-2 h-5 w-5" />
            {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </div>
        <p class="text-center mt-6 text-colorTextBlack dark:text-white text-[14px]">
          ¿Ya tienes una cuenta? <router-link to="/login" class="font-bold hover:underline">Inicio de Sesión</router-link>
        </p>
      </div>
    </form>

    <img src="@/assets/img/arrow-left.png" class="absolute top-0 right-0 w-36 md:w-auto" alt="Arrow Left">
    <img src="@/assets/img/arrow-rigth.png" class="absolute top-0 left-0 w-36 md:w-auto" alt="Arrow Right">

    <!-- Diálogo de validación -->
    <DialogValidation
        v-if="showValidationDialog"
        :email="email"
        @close="showValidationDialog = false"
    />
  </main>
</template>

<style scoped>
</style>