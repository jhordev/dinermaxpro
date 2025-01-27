<script setup>
import { Copy } from 'lucide-vue-next';
import CardLayout from "@/layouts/CardLayout.vue";
import { ref, onMounted, onUnmounted } from 'vue';
import { auth } from '@/services/firebase_config';
import { referralService } from '@/services/referral_service';
import { logInfo, logError } from '@/utils/logger';

const referralCode = ref('');
const referralLink = ref('');
const stats = ref({
  ownReferral: {
    totalReferrals: 0,
    earnings: 0
  }
});
const copied = ref(false);
let unsubscribe = null;

onMounted(async () => {
  if (auth.currentUser) {
    try {
      const code = await referralService.createReferralCode(auth.currentUser.uid, 'socio');
      referralCode.value = code;
      referralLink.value = `${window.location.origin}/register?ref=${code}`;

      unsubscribe = referralService.getReferralStats(auth.currentUser.uid, (newStats) => {
        stats.value = newStats;
      });

      logInfo('Suscripción a datos de referidos iniciada');
    } catch (error) {
      logError('Error al cargar datos de referidos:', error);
    }
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    logInfo('Suscripción a datos de referidos cancelada');
  }
});

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    copied.value = true;
    logInfo('Link de referido copiado');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    logError('Error al copiar el enlace:', error);
  }
};
</script>

<template>
  <CardLayout>
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Link de referidos (Socio)
    </h2>

    <div class="mt-5">
      <label class="font-semibold text-[14px] text-colorGraydark">
        Copia el link y comparte a tus amigos
      </label>
      <div class="mt-1.5 flex w-full bg-colorInputClaro p-2.5 rounded-[6px] gap-4 items-center">
        <span class="truncate text-[14px]">
          {{ referralLink }}
        </span>
        <button
            @click="handleCopy"
            class="flex items-center gap-2 cursor-pointer text-[12px] text-colorTextBlack font-bold border border-colorBorder md:border-transparent md:hover:border-colorBorder p-1 rounded-[5px] transition-all duration-300 ease-in-out"
        >
          <Copy class="h-4 w-4" />
          {{ copied ? 'Copiado!' : 'Copiar' }}
        </button>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <div class="relative w-[80px] h-[80px]">
        <img
            src="@/assets/img/item1.png"
            class="rounded-full w-[80px] h-[80px] object-cover"
            alt="Imagen de referidos"
        />
      </div>
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Total de referidos</h3>
        <strong class="font-bold text-[23px]">{{ stats.ownReferral?.totalReferrals || 0 }}</strong>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <div class="relative w-[80px] h-[80px]">
        <img
            src="@/assets/img/Tether.png"
            class="rounded-full w-[80px] h-[80px] object-cover"
            alt="Imagen de dinero"
        />
      </div>
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Ganancia Total</h3>
        <strong class="font-bold text-[23px]">$ {{ stats.ownReferral?.earnings?.toFixed(2) || '0.00' }}</strong>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
.bg-bgf3 {
  background-color: #f3f4f6;
}
</style>