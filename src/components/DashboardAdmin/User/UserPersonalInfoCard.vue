<script setup>
import { Copy, Loader2, Wallet } from "lucide-vue-next";
import { ref, watch } from 'vue';
import { logInfo, logError } from '@/utils/logger.js';
import { userService } from '@/services/user_service';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const userData = ref({
  photoURL: "https://via.placeholder.com/70",
  nombre: "",
  email: "",
  pais: "",
  telefono: "",
  referidoPor: "",
  wallet: ""
});

const isLoading = ref(true);
const isLoadingReferrer = ref(true);
const showTooltip = ref(false);

const loadReferrerName = async () => {
  isLoadingReferrer.value = true;
  try {
    userData.value.referidoPor = await userService.getReferrerName(props.userId);
  } catch (error) {
    logError('Error al cargar referido:', error);
  } finally {
    isLoadingReferrer.value = false;
  }
};

const loadUserData = async () => {
  isLoading.value = true;
  try {
    const response = await userService.getUserById(props.userId);
    if (response.success) {
      userData.value = {
        photoURL: response.data.photoURL || "https://via.placeholder.com/70",
        nombre: response.data.nombre || "Sin nombre",
        email: response.data.email || "Sin email",
        pais: response.data.pais || "No especificado",
        telefono: response.data.telefono || "No especificado",
        wallet: response.data.wallet || "No especificada",
        referidoPor: ""
      };
      loadReferrerName();
      logInfo('Datos de usuario cargados correctamente');
    } else {
      logError('Error al cargar datos del usuario');
    }
  } catch (error) {
    logError('Error:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.userId, (newId) => {
  if (newId) {
    loadUserData();
  }
}, {immediate: true});

const copyToClipboard = () => {
  navigator.clipboard.writeText(userData.value.wallet);
  showTooltip.value = true;
  logInfo('Wallet copiada al portapapeles');
  setTimeout(() => {
    showTooltip.value = false;
  }, 2000);
};
</script>

<template>
  <section class="p-5 shadow-custom-card-info rounded-[14px] relative">
    <div v-if="isLoading"
         class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
      <Loader2 class="w-8 h-8 animate-spin text-blue-500"/>
    </div>

    <header class="w-full flex justify-center pb-2.5 border-b border-gray:50 dark:border-colorGray2">
      <div class="flex flex-col items-center max-w-[208px]">
        <div class="border-8 rounded-full p-1.5">
          <div
              class="w-[70px] h-[70px] rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img
                :src="userData.photoURL"
                class="w-full h-full object-cover"
                alt="Profile"
            />
          </div>
        </div>
        <h3 class="mt-2.5 text-colorTextBlack dark:text-white text-[16px] font-semibold uppercase text-center">
          {{ userData.nombre }}
        </h3>
        <span class="mt-1.6 text-center text-[12px] text-gray-500">{{ userData.email }}</span>
      </div>
    </header>

    <article class="pt-2.5 text-colorTextBlack dark:text-white">
      <div class="flex p-1.5 items-center justify-between">
        <h3>País</h3>
        <h3>{{ userData.pais }}</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Teléfono</h3>
        <h3>{{ userData.telefono }}</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Referido por</h3>
        <div class="flex items-center">
          <h3>{{ userData.referidoPor }}</h3>
          <Loader2 v-if="isLoadingReferrer" class="w-4 h-4 animate-spin text-blue-500 ml-2"/>
        </div>
      </div>
    </article>

    <article class="flex items-center justify-between  gap-[25px] mt-2.5 p-2.5 bg-colorInputClaro rounded-[6px] relative">
      <div class="bg-white p-1 rounded-[5px]">
        <Wallet/>
      </div>
      <span class="truncate">{{ userData.wallet }}</span>
      <button class="cursor-pointer relative flex items-center" @click="copyToClipboard">
        <Copy/>
        <span
            v-if="showTooltip"
            class="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10"
        >
          Copiado
        </span>
      </button>
    </article>
  </section>
</template>

<style scoped>
</style>