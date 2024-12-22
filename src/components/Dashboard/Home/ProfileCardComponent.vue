<script setup>
import { ref, onMounted } from "vue";
import CardLayout from "@/layouts/CardLayout.vue";
import { Wallet, Copy, UserCircle2, Loader2 } from "lucide-vue-next";
import { userService } from '@/services/user_service';
import { logError } from '@/utils/logger';

const userData = ref({
  nombre: '',
  email: '',
  photoURL: '',
  pais: '',
  telefono: '',
  wallet: '',
  referidoPor: ''
});

const showTooltip = ref(false);
const imageLoading = ref(true);
const imageError = ref(false);

onMounted(async () => {
  try {
    const [userResponse, referrerName] = await Promise.all([
      userService.getUserData(),
      userService.getReferrerName()
    ]);

    if (userResponse.success) {
      userData.value = {
        ...userResponse.data,
        referidoPor: referrerName
      };
    }
  } catch (error) {
    logError('Error al obtener datos del usuario:', error);
  }
});

const handleImageLoad = () => {
  imageLoading.value = false;
  imageError.value = false;
};

const handleImageError = () => {
  imageLoading.value = false;
  imageError.value = true;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(userData.value.wallet);
    showTooltip.value = true;
    setTimeout(() => (showTooltip.value = false), 1500);
  } catch (error) {
    logError("Error al copiar al portapapeles:", error);
  }
};
</script>

<template>
  <CardLayout>
    <header class="w-full flex justify-center pb-2.5 border-b border-gray:50 dark:border-colorGray2">
      <div class="flex flex-col items-center max-w-[208px]">
        <div class="border-8 rounded-full p-1.5">
          <div class="w-[70px] h-[70px] rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <template v-if="userData.photoURL">
              <Loader2 v-if="imageLoading" class="animate-spin w-6 h-6 text-primary" />
              <UserCircle2 v-else-if="imageError" class="w-full h-full text-gray-400" />
              <img
                  v-show="!imageLoading && !imageError"
                  :src="userData.photoURL"
                  class="w-full h-full object-cover"
                  alt="Profile"
                  @load="handleImageLoad"
                  @error="handleImageError"
              />
            </template>
            <UserCircle2 v-else class="w-full h-full text-gray-400" />
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
        <h3>Pais</h3>
        <h3>{{ userData.pais || '-' }}</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Telefono</h3>
        <h3>{{ userData.telefono || '-' }}</h3>
      </div>
      <div class="flex p-1.5 items-center justify-between">
        <h3>Referido por</h3>
        <h3>{{ userData.referidoPor }}</h3>
      </div>
    </article>

    <article class="flex items-center gap-[25px] mt-2.5 p-2.5 bg-colorInputClaro rounded-[6px] relative">
      <div class="bg-white p-1 rounded-[5px]">
        <Wallet />
      </div>
      <span class="truncate">{{ userData.wallet || '-' }}</span>
      <button
          v-if="userData.wallet"
          @click="copyToClipboard"
          class="cursor-pointer relative flex items-center"
      >
        <Copy />
        <span
            v-if="showTooltip"
            class="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10"
        >
          Copiado
        </span>
      </button>
    </article>
  </CardLayout>
</template>

<style scoped>
button {
  position: relative;
}
button:active span {
  display: block;
}
</style>