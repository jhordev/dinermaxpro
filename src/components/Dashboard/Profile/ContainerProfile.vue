<script setup>
import {ChevronDown, MoveRight} from 'lucide-vue-next';
</script>

<template>
  <section class="rounded-[15px] bg-bgCardLigth p-5 md:p-[50px] shadow-default dark:bg-bgDashboardDark w-full ">
    <header class="flex justify-between items-center">
      <div class="flex items-center gap-3 md:gap-5">
        <div class="w-[60px] md:w-[100px]">
          <img src="@/assets/img/profile.jpg" alt="profile" class="w-full h-full object-cover rounded-full">
        </div>
        <div class=" flex flex-col gap-1">
          <h3 class="font-bold text-[16px] md:text-[20px] text-colorTextBlack dark:text-white">Jhordy Mondragon</h3>
          <span class="text-[10px] md:text-[16px] text-colorGray2">jhordymondragon@gmail.com</span>
        </div>
      </div>
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" value="" class="sr-only peer">
        <div class="relative w-14 h-7 bg-gray-200  dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-colorBgButton"></div>
      </label>
    </header>
    <div class="mt-[30px]">
      <form class="grid grid-cols-1 md:grid-cols-4 gap-[20px] md:gap-[30px]">
        <div class=" col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Nombre</label>
          <input type="text" placeholder="Juan Perez" class="pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
        </div>
        <div class=" col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Billetera (red: TRC20)</label>
          <input type="text" placeholder="12eb5cRuXFwaXwKFsqUFS7yYTFVXwsHak9" class="truncate pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
        </div>
        <div class="w-full  col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-[20px] md:gap-[30px]">
          <div class="w-full col-span-1 flex flex-col gap-2.5">
            <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Sexo</label>
            <div class="relative">
              <select id="countries" class=" cursor-pointer pl-5 w-full py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal appearance-none">
                <option selected class="bg-bgCardLigth dark:bg-bgDashboardDark text-colorTextBlack dark:text-white">Seleccione su sexo</option>
                <option value="MAS" class="bg-bgCardLigth dark:bg-bgDashboardDark text-colorTextBlack dark:text-white">Masculino</option>
                <option value="FEM" class="bg-bgCardLigth dark:bg-bgDashboardDark text-colorTextBlack dark:text-white">Femenino</option>
              </select>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown />
            </span>
            </div>

          </div>
          <div class="col-span-1 flex flex-col gap-2.5">
            <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Teléfono</label>
            <input type="text" placeholder="+51 959 659 502" class="pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
          </div>
          <div class="col-span-1 flex flex-col gap-2.5">
            <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">País</label>
            <input type="text" placeholder="Panamá" class="pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
          </div>
        </div>
        <div class="col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Referido por</label>
          <input type="text" placeholder="Pedro Picapiedra" class="pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
        </div>
        <div class="col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Actualizar Contraseña</label>
          <div class="flex items-center justify-between pr-5 gap-8  text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
            <input type="text" placeholder="jhordev.pe@gmail.com" class="w-full pl-5 py-3 md:py-4 bg-transparent outline-none ">
            <button type="button" class="hover:scale-125 transition-transform duration-300 ease-in-out"><MoveRight /></button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>

</style>