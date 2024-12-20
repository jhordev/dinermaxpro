<script setup>

</script>

<template>
  <section class="rounded-[15px] bg-colorInputClaro p-2.5 shadow-default dark:bg-bgDashboardDark w-full ">
    <div class="flex relative flex-row-reverse gap-2 md:gap-2.5 items-center pt-5 md:pt-0">
      <div class="flex flex-col  gap-1.5 md:gap-2.5 w-full">
        <h2 class="text-colorTextBlack dark:text-white font-bold text-[14px]">Forma de pago</h2>
        <div class="text-colorTextBlack dark:text-white flex items-end gap-1 d:gap-3">
          <span class="font-black uppercase text-[25px] md:text-[36px]">bv</span>
          <p class="font-bold text-[12px] md:text-[14px]">Red: Wallet-Tron (TRC20)</p>
        </div>
        <div class="flex justify-between items-center gap-2.5 bg-white dark:bg-colorTextBlack p-2 rounded-[10px]">
          <span class="text-[12px] md:text-[14px] truncate text-colorTextBlack dark:text-white">12eb5cRuXFwaXwKFsqUFS7yYTFVXwsHak9</span>
          <button type="button" class="border border-colorTextBlack dark:border-gray-50 px-2 py-2 rounded-[5px] text-[10px] text-colorTextBlack dark:text-white">
            Copiar
          </button>
        </div>
      </div>
      <img src="@/assets/img/qr.png" class=" w-[80px] md:w-auto absolute top-0 right-0 md:relative" />
    </div>
  </section>
</template>

<style scoped>

</style>