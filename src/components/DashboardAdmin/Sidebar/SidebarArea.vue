<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { onClickOutside } from '@vueuse/core'
import { ChevronsLeft, Network, TrendingUpDown, LayoutDashboard, MonitorCog, MessageCircleQuestion, Users, BookUser } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import SidebarItem from './SidebarItem.vue'
import SecureLS from 'secure-ls';
import { useRoute } from 'vue-router';

const ls = new SecureLS({ encodingType: 'aes' });
const target = ref(null)
const sidebarStore = useSidebarStore()
const route = useRoute();

const userRole = computed(() => ls.get('user_role') || '');

onClickOutside(target, () => {
  sidebarStore.isSidebarOpen = false
})

const menuGroups = ref([
  {
    menuItems: [
      { icon: LayoutDashboard, label: 'Dashboard', route: '/admin' },
      { icon: Users, label: 'Usuarios', route: '/admin/user' },
      { icon: BookUser, label: 'Contratos', route: '/admin/contracts' },
      { icon: TrendingUpDown , label: 'Retiros', route: '/admin/operation' },
      {
        icon: MonitorCog,
        label: 'Sistema',
        route: '#',
        adminOnly: true,
        children: [
          {label: 'Planes', route: '/admin/plans'},
          {label: 'Configuración', route: '/admin/configurations'},
          {label: 'Socios', route: '/admin/socios'}
        ]
      },
      {icon: Network, label: 'Red de referidos', route: '/admin/referidosadmin', hideFromAdmin: true}
    ]
  }
])

function handleClick(item) {
  if (item.children) {
    return
  }
  sidebarStore.isSidebarOpen = false
}

function isActive(routePath) {
  return route.path === routePath;
}
</script>

<template>
  <aside
      class="md:w-[280px] md:pt-12 pt-4 absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-bgDashboardLigth dark:bg-bgDashboardDark duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0"
      :class="{
      'translate-x-0': sidebarStore.isSidebarOpen,
      '-translate-x-full': !sidebarStore.isSidebarOpen,
      'lg:translate-x-0': sidebarStore.isSidebarOpen
    }"
      ref="target"
  >
    <div class="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
      <router-link to="/" class="flex items-center">
        <img src="@/assets/img/isotipo.png" alt="Logo" class="w-12"/>
        <span class="md:text-[24px] font-bold text-colorTextBlack dark:text-white">DinnerMax</span>
      </router-link>

      <button class="block lg:hidden text-colorTextBlack dark:text-white"
              @click="sidebarStore.isSidebarOpen = !sidebarStore.isSidebarOpen">
        <ChevronsLeft/>
      </button>
    </div>

    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
        <template v-for="menuGroup in menuGroups" :key="menuGroup.name">
          <div>
            <ul class="mb-6 flex flex-col gap-[22px]">
              <template v-for="(menuItem, index) in menuGroup.menuItems" :key="index">
                <SidebarItem
                    v-if="(!menuItem.adminOnly || userRole === 'admin') && (!menuItem.hideFromAdmin || userRole !== 'admin')"
                    :item="menuItem"
                    :index="index"
                    :icon="menuItem.icon"
                    :class="isActive(menuItem.route) ? 'bg-gray-200 dark:bg-colorTextBlack' : ''"
                    @click="handleClick(menuItem)"
                />
              </template>
              <a href="https://wa.me/593963620095?text=Hola%2C%20Jhordev" target="_blank" class="group relative flex items-center gap-5 rounded-sm py-3 px-4 font-medium text-colorTextBlack dark:text-white duration-300 ease-in-out hover:bg-bghoverligth dark:hover:bg-colorTextBlack cursor-pointer">
                <MessageCircleQuestion class="text-current w-5 h-5"/>
                <span>Soporte</span>
              </a>
            </ul>
          </div>
        </template>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
</style>
