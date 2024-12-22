<script setup>
import { ref, onMounted } from 'vue';
import { useClipboard } from '@vueuse/core';
import { auth } from '@/services/firebase_config';
import { referralService } from '@/services/referral_service';
import { userService } from '@/services/user_service';
import CardLayout from "@/layouts/CardLayout.vue";
import { Copy, Loader, User } from 'lucide-vue-next';
import { logInfo, logError } from '@/utils/logger';

const referralCode = ref('');
const referralLink = ref('');
const stats = ref({
  totalReferrals: 0,
  earnings: 0
});
const loading = ref(false);
const imageLoading = ref(true);
const imageError = ref(false);
const userData = ref(null);
const { copy, copied } = useClipboard();

const handleImageError = () => {
  imageError.value = true;
  imageLoading.value = false;
};

const handleImageLoad = () => {
  imageLoading.value = false;
  imageError.value = false;
};

onMounted(async () => {
  if (auth.currentUser) {
    loading.value = true;
    try {
      // Cargar datos del usuario
      const userDataResult = await userService.getUserData();
      if (userDataResult.success) {
        userData.value = userDataResult.data;
      }

      // Obtener o crear código de referido
      const code = await referralService.createReferralCode(auth.currentUser.uid);
      referralCode.value = code;
      referralLink.value = `${window.location.origin}/register?ref=${code}`;

      // Cargar estadísticas
      const userStats = await referralService.getReferralStats(auth.currentUser.uid);
      stats.value = userStats;

      logInfo('Datos de referidos cargados exitosamente');
    } catch (error) {
      logError('Error al cargar datos de referidos:', error);
    } finally {
      loading.value = false;
    }
  }
});

const handleCopy = async () => {
  await copy(referralLink.value);
  logInfo('Link de referido copiado');
};
</script>

<template>
  <CardLayout>
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Link de referidos
    </h2>
    <div class="mt-5">
      <label class="font-semibold text-[14px] text-colorGraydark">
        Copia el link y comparte a tus amigos
      </label>
      <div class="mt-1.5 flex w-full bg-colorInputClaro p-2.5 rounded-[6px] gap-4 items-center">
        <span class="truncate text-[14px]">{{ referralLink }}</span>
        <button
            @click="handleCopy"
            class="flex items-center gap-2 cursor-pointer text-[12px] text-colorTextBlack font-bold border border-colorBorder md:border-transparent md:hover:border-colorBorder p-1 rounded-[5px] transition-all duration-300 ease-in-out"
            :disabled="loading"
        >
          <Loader v-if="loading" class="animate-spin h-4 w-4" />
          <template v-else>
            <Copy class="h-4 w-4" />
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </template>
        </button>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <div class="relative w-[80px] h-[80px]">
        <!-- Loader mientras carga la imagen -->
        <div v-if="imageLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          <Loader class="animate-spin h-6 w-6 text-gray-500" />
        </div>

        <!-- Imagen del usuario -->
        <template v-if="userData?.photoURL && !imageError">
          <img
              :src="userData.photoURL"
              class="rounded-full w-[80px] h-[80px] object-cover"
              @load="handleImageLoad"
              @error="handleImageError"
              alt="Perfil"
          />
        </template>

        <!-- Icono por defecto -->
        <div v-if="imageError || !userData?.photoURL" class="w-[80px] h-[80px] rounded-full bg-gray-200 flex items-center justify-center">
          <User class="h-8 w-8 text-gray-500" />
        </div>
      </div>
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Total de referidos</h3>
        <strong class="font-bold text-[23px]">{{ stats.totalReferrals }}</strong>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <div class="relative w-[80px] h-[80px]">
        <!-- Loader mientras carga la imagen -->
        <div v-if="imageLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          <Loader class="animate-spin h-6 w-6 text-gray-500" />
        </div>

        <!-- Imagen del usuario -->
        <template v-if="userData?.photoURL && !imageError">
          <img
              :src="userData.photoURL"
              class="rounded-full w-[80px] h-[80px] object-cover"
              @load="handleImageLoad"
              @error="handleImageError"
              alt="Perfil"
          />
        </template>

        <!-- Icono por defecto -->
        <div v-if="imageError || !userData?.photoURL" class="w-[80px] h-[80px] rounded-full bg-gray-200 flex items-center justify-center">
          <User class="h-8 w-8 text-gray-500" />
        </div>
      </div>
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Ganancia Total</h3>
        <strong class="font-bold text-[23px]">${{ stats.earnings.toFixed(2) }}</strong>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
</style>