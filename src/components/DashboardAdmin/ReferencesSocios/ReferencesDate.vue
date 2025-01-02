<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { defineProps, ref } from "vue";
// Props para recibir los datos dinámicos
const props = defineProps({
  referralLink: {
    type: String,
    required: true,
  },
  totalReferrals: {
    type: Number,
    required: true,
  },
  totalEarnings: {
    type: Number,
    required: true,
  },
});

// Estado para mostrar el tooltip
const showTooltip = ref(false);

// Función para copiar el enlace de referidos
const copyToClipboard = () => {
  navigator.clipboard.writeText(props.referralLink)
      .then(() => {
        showTooltip.value = true;
        setTimeout(() => {
          showTooltip.value = false;
        }, 2000); // El tooltip desaparece después de 2 segundos
      })
      .catch((err) => {
        console.error("Error al copiar el enlace: ", err);
      });
};
</script>

<template>
  <CardLayout>
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Link de referidos
    </h2>
    <div class="mt-5">
      <label class="font-semibold text-[14px] text-colorGraydark">Copia el link y comparte a tus amigos</label>
      <div class="mt-1.5 flex w-full bg-colorInputClaro p-2.5 rounded-[6px] gap-4 items-center relative">
        <span class="truncate text-[14px]">{{ referralLink }}</span>
        <button
            @click="copyToClipboard"
            class="cursor-pointer text-[12px] text-colorTextBlack font-bold border border-colorBorder md:border-transparent md:hover:border-colorBorder p-1 rounded-[5px] transition-all duration-300 ease-in-out">
          Copiar
        </button>
        <div
            v-if="showTooltip"
            class="absolute top-[-30px] right-0 bg-black text-white text-[12px] py-1 px-2 rounded-[4px]">
          ¡Copiado!
        </div>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <img src="@/assets/img/item1.png" class="rounded-full w-[80px]" />
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Total de referidos</h3>
        <strong class="font-bold text-[23px]">{{ totalReferrals }}</strong>
      </div>
    </div>

    <div class="mt-5 p-5 bg-bgf3 rounded-[10px] flex gap-[30px] items-center">
      <img src="@/assets/img/item2.png" class="rounded-full w-[80px]" />
      <div class="flex flex-col gap-[10px]">
        <h3 class="text-gray-500 font-bold text-[16px]">Ganancia Total</h3>
        <strong class="font-bold text-[23px]">$ {{ totalEarnings.toFixed(2) }}</strong>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
/* Aquí puedes agregar estilos específicos si lo necesitas */
.relative {
  position: relative;
}
</style>
