<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { onClickOutside } from '@vueuse/core'
import { ChevronsLeft, LayoutDashboard, Gem, Wallet, Network, MessageCircleQuestion } from 'lucide-vue-next'
import { ref } from 'vue'
import SidebarItem from './SidebarItem.vue'
import DarkModeSwitcher from "./DarkModeSwitcher.vue"

const target = ref(null)
const sidebarStore = useSidebarStore()

// Cerrar el sidebar al hacer clic fuera de él
onClickOutside(target, () => {
  sidebarStore.isSidebarOpen = false
})

const menuGroups = ref([
  {
    menuItems: [
      { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard' },
      { icon: Gem, label: 'Membresia', route: '/dashboard/membership' },
      { icon: Wallet, label: 'Billetera', route: '/dashboard/wallet' },
      { icon: Network, label: 'Red de referidos', route: '/network' },
      { icon: MessageCircleQuestion, label: 'Soporte', route: '/soporte' }
    ]
  }
])
</script>

<template>
  <aside
      class="md:w-[280px] md:pt-12 pt-4 absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-bgDashboardLigth dark:bg-bgDashboardDark duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0"
      :class="{
      'translate-x-0': sidebarStore.isSidebarOpen,
      '-translate-x-full': !sidebarStore.isSidebarOpen,
      'lg:translate-x-0': sidebarStore.isSidebarOpen  // Aseguramos que en pantallas grandes esté siempre visible
    }"
      ref="target"
  >
    <!-- SIDEBAR HEADER -->
    <div class="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
      <router-link to="/" class="flex items-center">
        <img src="@/assets/img/isotipo.png" alt="Logo" class="w-12" />
        <span class="md:text-[24px] font-bold text-colorTextBlack dark:text-white">DinnerMax</span>
      </router-link>

      <button class="block lg:hidden text-colorTextBlack dark:text-white" @click="sidebarStore.isSidebarOpen = !sidebarStore.isSidebarOpen">
        <ChevronsLeft />
      </button>
    </div>
    <!-- SIDEBAR HEADER -->

    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <!-- Sidebar Menu -->
      <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
        <template v-for="menuGroup in menuGroups" :key="menuGroup.name">
          <div>
            <ul class="mb-6 flex flex-col gap-[22px]">
              <SidebarItem
                  v-for="(menuItem, index) in menuGroup.menuItems"
                  :item="menuItem"
                  :key="index"
                  :index="index"
                  :icon="menuItem.icon"
                  @click="sidebarStore.isSidebarOpen = !sidebarStore.isSidebarOpen"
              />
            </ul>
          </div>
        </template>
        <DarkModeSwitcher />
      </nav>
    </div>
  </aside>
</template>
