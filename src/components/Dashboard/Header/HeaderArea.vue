<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import DarkModeSwitcher from './DarkModeSwitcher.vue'
import { Menu } from 'lucide-vue-next'
import DropdownNotification from './DropdownNotification.vue'
import DropdownUser from './DropdownUser.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { toggleSidebar } = useSidebarStore()
const sidebarStore = useSidebarStore()
const route = useRoute()

const pageTitle = computed(() => {
  const routePath = route.path
  switch (routePath) {
    case '/':
      return 'Dashboard'
    case '/dashboard/membership':
      return 'Menbresía'
    case '/dashboard/wallet':
      return 'Billetera'
    case '/dashboard/profile':
      return 'Perfil'
    case '/dashboard/references':
      return 'Red de Referidos'
    default:
      return 'Dashboard'
  }
})
</script>

<template>
  <header
      class="sticky top-0 z-20 flex w-full bg-white dark:bg-colorTextBlack drop-shadow-1 dark:drop-shadow-none"
  >
    <div class="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
      <div class="flex items-center gap-1 md:gap-2 sm:gap-4">
        <button
            class="block rounded-sm text-colorTextBlack dark:text-white shadow-sm lg:hidden"
            @click="() => {
            console.log('Toggling Sidebar')
            toggleSidebar()
          }"
        >
          <Menu class="w-8 h-8"/>
        </button>
        <router-link class="block flex-shrink-0 lg:hidden" to="/">
          <img src="@/assets/img/isotipo.png" alt="Logo" class="w-10" />
        </router-link>
        <h1 class="font-bold text-12px] md:text-[24px] text-colorTextBlack dark:text-white tracking-[2.4px]">
          {{ pageTitle }}
        </h1>
      </div>
      <div class="hidden sm:block">
        <form action="https://formbold.com/s/unique_form_id" method="POST">
          <div class="relative">
            <button class="absolute top-1/2 left-0 -translate-y-1/2">
              <svg
                  class="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                />
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div class="flex items-center gap-8 md:gap-[60px]">
        <ul class="flex items-center gap-2 2xsm:gap-4">
          <li class="flex items-center">
            <DarkModeSwitcher />
          </li>
          <DropdownNotification />
        </ul>
        <DropdownUser />
      </div>
    </div>
  </header>
</template>