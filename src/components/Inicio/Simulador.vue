<script setup>

</script>

<template>
  <section class="container-section pt-[45px] md:pt-[105px] flex flex-col items-center w-full">
    <h2 class="text-center text-[32px] md:text-[60px]  leading-10 md:leading-[140%] text-colorTextBlack dark:text-white font-black">Simulador de Ganacias</h2>
    <div class="bg-white dark:bg-colorSimulador py-11 px-5 mt-4 md:mt-8 rounded-[30px] flex flex-col items-center gap-6 md:max-w-[630px] md:px-[135px]">

      <div class="flex flex-col gap-[6px] w-full">
          <label class="text-colorGray font-semibold">Elige el Plan</label>
          <div class="bg-colorInputClaro dark:bg-colorTextBlack rounded-[7px] w-full p-[7px] h-[65px]">
            <select id="small" class="h-full  block w-full p-2 mb-6 text-[14px] font-bold uppercase text-gray-900  rounded-[3.5px] bg-white outline-none dark:bg-colorInput dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ">
              <option selected>Plan Básico</option>
              <option value="estandar">Plan Estandar</option>
              <option value="premium">Plan Premium</option>
            </select>
          </div>
      </div>

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
      <img src="@/assets/img/convert.svg" class="w-[22px] h-[16px]"/>

      <div class="flex flex-col gap-[6px] w-full">
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
  </section>
</template>

<style scoped>

</style>