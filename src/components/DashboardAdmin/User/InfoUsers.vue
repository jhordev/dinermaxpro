<script setup>
import { computed } from "vue";
import UserPersonalInfoCard from "@/components/DashboardAdmin/User/UserPersonalInfoCard.vue";
import ActiveMembershipCard from "@/components/DashboardAdmin/User/ActiveMembershipCard.vue";
import WalletHistoryCard from "@/components/DashboardAdmin/User/WalletHistoryCard.vue";
import {Printer, Star, Trash, CircleUserRound} from 'lucide-vue-next'

// Props para recibir información dinámica
const props = defineProps({
  user: {
    type: String,
    required: false,
    default: null,
  },
});

const userName = computed(() => props.user || "BUSTAMANTE ZURITA ANIBAL GUSTAVO");
</script>

<template>
  <section>
    <header class="flex flex-row justify-between items-center pb-5">
      <div class="flex items-center gap-2.5 text-colorTextBlack dark:text-white">
        <CircleUserRound class="w-8 h-8" />
        <span class="hidden lg:block text-[20px] font-medium">
          {{ userName }}
        </span>
      </div>

      <div class="inline-flex rounded-md shadow-sm">
        <a
            href="#"
            aria-current="page"
            class="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          <Printer />
        </a>
        <a
            href="#"
            class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          <Star />
        </a>
        <a
            href="#"
            class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          <Trash />
        </a>
      </div>
    </header>
    <main class="grid grid-cols-8 mt-5 gap-5">
      <UserPersonalInfoCard class="col-span-8 lg:col-span-4" />
      <ActiveMembershipCard class="col-span-8 lg:col-span-4" />
      <WalletHistoryCard class="col-span-8" />
    </main>
  </section>
</template>

<style scoped></style>
