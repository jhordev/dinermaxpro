<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import {ArrowDownUp} from 'lucide-vue-next'
</script>

<template>
    <CardLayout>
      <h2 class="text-[18px] text-colorTextBlack dark:text-white tracking-[1.8px] font-bold">
        Conversor
      </h2>
      <div class="flex flex-col items-center mt-5">
        <div class="flex flex-col gap-[6px] w-full">
          <label class="text-colorGray font-semibold">Monto</label>
          <div class="bg-colorInputClaro dark:bg-colorTextBlack rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2">
            <div class=" bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
              <div class="bg-[#50AF95] p-1 rounded-full"><img src="@/assets/img/usdt.svg" class="w-4 h-4"/></div>
              <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">usdt</span>
            </div>
            <input class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none" placeholder="$1500" />
          </div>
        </div>
        <ArrowDownUp class="mt-2.5 text-colorTextBlack dark:text-white" />
        <div class="-mt-2 flex flex-col gap-[6px] w-full">
          <label class="text-colorGray font-semibold">Ganancias</label>
          <div class=" bg-colorInputClaro dark:bg-colorTextBlack rounded-[7px] w-full p-[7px] h-[65px] grid grid-cols-2">
            <div class=" bg-white dark:bg-colorInput h-full py-[5px] px-[12px] flex items-center gap-[10px] w-fit rounded-[3.5px]">
              <div class="bg-[#50AF95] p-1 rounded-full"><img src="@/assets/img/usdt.svg" class="w-4 h-4"/></div>
              <span class="text-[14px] text-colorTextBlack dark:text-white uppercase font-bold">usdt</span>
            </div>
            <input class="bg-transparent font-semibold text-end pr-2 text-colorTextBlack dark:text-white outline-none" placeholder="$1500" />
          </div>
        </div>
      </div>
      <button class="font-semibold text-[18px] bg-colorBgButton w-full mt-[26px] py-[18px] rounded-[10px] text-white tracking-[1.8px]">
        Retirar
      </button>
    </CardLayout>
</template>

<style scoped>

</style>