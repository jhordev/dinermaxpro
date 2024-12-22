<script setup>
import { ref, computed } from 'vue';
import CardLayout from "@/layouts/CardLayout.vue";

const saldoDis = 1000;
const saldo = ref(saldoDis);
const montoRetirar = ref(null); // Monto ingresado en el input
const porcentajeRetiro = ref(null); // 3% del monto ingresado
const totalRetiro = ref(null); // Total final después de restar el 3%

// Computed para validar el botón y el estilo del input
const isButtonDisabled = computed(
    () => !montoRetirar.value || montoRetirar.value < 50 || montoRetirar.value > saldo.value
);
const inputBgClass = computed(() => {
  if (montoRetirar.value > saldo.value) return "bg-red-500";
  if (montoRetirar.value >= 50 && montoRetirar.value <= saldo.value) return "bg-green-500";
  return "bg-colorInputClaro dark:bg-colorTextBlack";
});

// Watch para calcular el porcentaje y el total cuando el monto sea válido
import { watch } from 'vue';
watch(montoRetirar, (newValue) => {
  if (newValue && newValue >= 50 && newValue <= saldo.value) {
    porcentajeRetiro.value = (newValue * 0.03).toFixed(2); // 3% del monto
    totalRetiro.value = (newValue - porcentajeRetiro.value).toFixed(2); // Total después de restar el 3%
  } else {
    porcentajeRetiro.value = null;
    totalRetiro.value = null;
  }
});
</script>

<template>
  <CardLayout>
    <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
      Operación
    </h2>
    <div class="flex flex-col items-center mt-5 gap-[20px]">
      <!-- Saldo -->
      <div class="flex flex-col gap-[6px] w-full">
        <label class="text-colorGray font-semibold">Ingrese monto a retirar</label>
        <div :class="`rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2 ${inputBgClass}`">
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
            <div class="bg-[#50AF95] p-1 rounded-full">
              <img src="@/assets/img/usdt.svg" class="w-4 h-4" />
            </div>
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">usdt</span>
          </div>
          <input
              v-model.number="montoRetirar"
              type="number"
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none appearance-none spin-button-none"
              :placeholder="`MAX $ ${saldoDis.valueOf()}`"
          />
        </div>
      </div>

      <!-- Total porcentaje -->
      <div v-if="porcentajeRetiro !== null" class="flex flex-col gap-[6px] w-full animate-fade-in">
        <div class="rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2 bg-colorInputClaro dark:bg-colorTextBlack">
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">- 3% de retiro</span>
          </div>
          <input
              :value="porcentajeRetiro"
              type="text"
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none appearance-none"
              disabled
          />
        </div>
      </div>

      <!-- Total a retirar -->
      <div v-if="totalRetiro !== null" class="flex flex-col gap-[6px] w-full animate-fade-in">
        <div class="rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2 bg-colorInputClaro dark:bg-colorTextBlack">
          <div
              class="bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
            <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">Total</span>
          </div>
          <input
              :value="totalRetiro"
              type="text"
              class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none appearance-none"
              disabled
          />
        </div>
      </div>
    </div>

    <button
        :disabled="isButtonDisabled"
        :class="isButtonDisabled ? 'bg-gray-400' : 'bg-colorBgButton'"
        class="font-semibold text-[18px] w-full mt-[26px] py-[18px] rounded-[10px] text-white tracking-[1.8px]"
    >
      Retirar
    </button>
  </CardLayout>
</template>

<style scoped>
.bg-red-500 {
  background-color: #f87171;
}

.bg-green-500 {
  background-color: #4ade80;
}

.bg-gray-400 {
  background-color: #d1d5db;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

input[type="number"].spin-button-none::-webkit-inner-spin-button,
input[type="number"].spin-button-none::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"].spin-button-none {
  -moz-appearance: textfield;
}
</style>
