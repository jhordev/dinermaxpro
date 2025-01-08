<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Search, X, Loader2 } from "lucide-vue-next";
import InfoUsers from "@/components/DashboardAdmin/User/InfoUsers.vue";
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import { subscribeToUsersList } from '@/services/users_list_service';
import { logError, logInfo } from '@/utils/logger';

const users = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const selectedUser = ref(null);
const showModal = ref(false);
const filterPlan = ref('all');
let unsubscribe = null;

const setupUsersSubscription = async () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  loading.value = true;
  try {
    unsubscribe = await subscribeToUsersList((updatedUsers) => {
      if (updatedUsers) {
        users.value = updatedUsers;
        logInfo('Lista de usuarios actualizada');
      }
      loading.value = false;
    }, filterPlan.value);
  } catch (error) {
    logError('Error al configurar la suscripción: ' + error.message);
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value;
  return users.value.filter(user =>
      user.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

function openModal(user) {
  try {
    selectedUser.value = user;
    if (window.innerWidth < 1024) {
      showModal.value = true;
    }
  } catch (error) {
    logError('Error al abrir el modal: ' + error.message);
  }
}

function closeModal() {
  try {
    selectedUser.value = null;
    showModal.value = false;
  } catch (error) {
    logError('Error al cerrar el modal: ' + error.message);
  }
}

onMounted(async () => {
  try {
    await setupUsersSubscription();
    logInfo('Componente montado correctamente');
  } catch (error) {
    logError('Error durante el montaje: ' + error.message);
  }
});

onUnmounted(() => {
  try {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      logInfo('Suscripción cancelada correctamente');
    }
  } catch (error) {
    logError('Error durante el desmontaje: ' + error.message);
  }
});

watch(filterPlan, async (newValue) => {
  try {
    await setupUsersSubscription();
    logInfo(`Filtro cambiado a: ${newValue}`);
  } catch (error) {
    logError('Error al cambiar el filtro: ' + error.message);
  }
}, { immediate: false });
</script>

<template>
  <main class="grid grid-cols-10 gap-[15px] lg:gap-[22px]">
    <CardLayout class="col-span-10 lg:col-span-3 h-[100%]">
      <!-- Buscador -->
      <div class="w-full bg-colorInputClaro dark:bg-gray-800 rounded-[15px] flex gap-1.5 py-2.5 px-4">
        <Search class="text-gray-500" />
        <input
            v-model="searchTerm"
            type="text"
            class="text-[16px] font-normal bg-transparent w-full outline-none text-colorTextBlack dark:text-white"
            placeholder="Buscar usuario..."
        />
      </div>
      <section class="mt-6">
       <div class="flex justify-between items-center">
         <h3 class="text-colorTextBlack text-[16px] font-bold dark:text-white">
           Usuarios ({{ filteredUsers.length }})
         </h3>
         <!-- Dropdown filterPlan users -->
         <div class="flex items-center justify-end ">
           <select
               v-model="filterPlan"
               class="w-fit text-[14px]   bg-transparent rounded-[15px] py-2.5 px-4 text-colorTextBlack dark:text-white outline-none cursor-pointer min-w-[120px] "
           >
             <option value="all" class=" bg-colorInputClaro dark:bg-gray-800">Todos</option>
             <option value="with-plan" class=" bg-colorInputClaro dark:bg-gray-800">Con plan</option>
             <option value="without-plan" class=" bg-colorInputClaro dark:bg-gray-800">Sin plan</option>
           </select>
         </div>
       </div>
        <nav class="overflow-y-auto max-h-[calc(100vh_-_250px)] mt-5">
          <div v-if="loading" class="flex justify-center py-4">
            <Loader2 class="animate-spin text-primary w-6 h-6" />
          </div>
          <div v-else-if="filteredUsers.length === 0" class="text-center py-4 text-gray-500">
            No se encontraron usuarios
          </div>
          <ul v-else class="space-y-2">
            <li
                v-for="user in filteredUsers"
                :key="user.id"
                class="py-3 px-4 text-colorTextBlack dark:text-white hover:bg-[#4880FF] hover:text-white cursor-pointer rounded-lg transition-colors"
                :class="{ 'bg-[#4880FF] text-white': selectedUser?.id === user.id }"
                @click="openModal(user)"
            >
              {{ user.nombre }}
            </li>
          </ul>
        </nav>
      </section>
    </CardLayout>

    <!-- Desktop View -->
    <CardLayout v-if="selectedUser" class="col-span-10 lg:col-span-7 hidden lg:block">
      <InfoUsers :user="selectedUser" />
    </CardLayout>
    <div v-else class="col-span-10 lg:col-span-7 hidden lg:flex items-center justify-center">
      <p class="text-gray-500">Selecciona un usuario para ver sus detalles</p>
    </div>

    <!-- Mobile Modal -->
    <transition name="modal">
      <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
            class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md h-[90%] overflow-hidden m-4"
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
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>