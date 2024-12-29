<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Search, X } from "lucide-vue-next";
import InfoUsers from "@/components/DashboardAdmin/User/InfoUsers.vue";
import { ref } from "vue";

const selectedUser = ref(null);
const showModal = ref(false);

function openModal(user) {
  if (window.innerWidth < 1024) { // Solo abre el modal si la pantalla es menor a 1024px
    selectedUser.value = user;
    showModal.value = true;
  }
}

function closeModal() {
  selectedUser.value = null;
  showModal.value = false;
}
</script>

<template>
  <main class="grid grid-cols-10 gap-[15px] lg:gap-[22px]">
    <CardLayout class="col-span-10 lg:col-span-3 h-[100%]">
      <header class="flex gap-2.5 md:gap-5 md:justify-between items-center mb-4">
        <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
          <Search class="text-gray-500" />
          <input
              type="text"
              class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white"
              placeholder="Buscar..."
          />
        </div>
      </header>
      <section class="mt-6">
        <h3 class="text-colorTextBlack text-[16px] font-bold dark:text-white">Usuarios</h3>
        <nav class="overflow-y-auto max-h-[calc(100%_-_50px)] mt-5">
          <ul>
            <li
                class="py-3 px-4 text-colorTextBlack dark:text-white hover:bg-[#4880FF] cursor-pointer"
                @click="openModal('Jhordy Mondragon')"
            >
              Jhordy Mondragon
            </li>
            <li
                class="py-3 px-4 text-colorTextBlack dark:text-white hover:bg-[#4880FF] cursor-pointer"
                @click="openModal('Juan Solo')"
            >
              Juan Solo
            </li>
          </ul>
        </nav>
      </section>
    </CardLayout>

    <!-- Desktop View -->
    <CardLayout class="col-span-10 lg:col-span-7 hidden lg:block">
      <InfoUsers />
    </CardLayout>

    <!-- Mobile Modal -->
    <transition name="modal">
      <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
            class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md h-[90%] overflow-hidden"
        >
          <header class="flex justify-between items-center px-5 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 class="text-lg font-semibold text-colorTextBlack dark:text-white">
              Información del usuario
            </h3>
            <button
                @click="closeModal"
                class="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <X />
            </button>
          </header>
          <div class="overflow-y-auto h-full p-5">
            <InfoUsers :user="selectedUser" />
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter,
.modal-leave-to {
  opacity: 0;
}
</style>
