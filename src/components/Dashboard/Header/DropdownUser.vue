<script setup>
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import {ChevronDown, CircleUserRound, LogOut} from 'lucide-vue-next'

const target = ref(null)
const dropdownOpen = ref(false)

onClickOutside(target, () => {
  dropdownOpen.value = false
})
</script>

<template>
  <div class="relative" ref="target">
    <router-link
      class="flex items-center gap-4"
      to="#"
      @click.prevent="dropdownOpen = !dropdownOpen"
    >
      <span class="hidden text-right lg:block">
        <span class="block text-sm font-medium text-colorTextBlack dark:text-white">Jhordy Mondragon</span>
        <span class="block text-xs font-medium text-colorTextBlack dark:text-white">jhordy@gmail.com</span>
      </span>

      <span class="w-10 h-10 md:h-12 md:w-12 rounded-full">
        <img src="@/assets/img/user/user-01.png" alt="User" />
      </span>

      <ChevronDown class="text-colorTextBlack dark:text-white hidden md:block" />
    </router-link>

    <!-- Dropdown Start -->
    <div
      v-show="dropdownOpen"
      class="w-48 md:w-auto absolute py-[18px]  px-4 right-0 mt-4 flex w-62.5 flex-col rounded-[16px]  bg-white dark:bg-bgDashboardDark"
    >
      <ul class="flex flex-col gap-5  ">
        <li>
          <router-link
              @click.prevent="dropdownOpen = !dropdownOpen"
            to="/dashboard/profile"
            class="text-colorTextBlack dark:text-white flex px-2 py-4 md:px-6 items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base hover:bg-bghoverligth  dark:hover:bg-colorTextBlack"
          >
            <CircleUserRound />
            Perfil
          </router-link>
        </li>
      </ul>
      <button
        class=" text-colorTextBlack dark:text-white flex items-center gap-3.5 py-4 px-2 md:px-6 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base hover:bg-bghoverligth  dark:hover:bg-red-900"
      >
        <LogOut />
        Cerrar sesión
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>
