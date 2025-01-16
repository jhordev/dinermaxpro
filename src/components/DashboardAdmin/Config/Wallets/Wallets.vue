<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Plus, Loader2 } from "lucide-vue-next";
import { walletService } from '@/services/wallet_service.js';
import { logInfo, logError } from '@/utils/logger.js';
import CardWallets from "@/components/DashboardAdmin/Config/Wallets/CardWallets.vue";
import AddWalletModal from "@/components/DashboardAdmin/Config/Wallets/AddWalletModal.vue";
import CardLayout from "@/layouts/CardLayout.vue";

const wallets = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const editData = ref(null);
const isLoading = ref(false);
let unsubscribe = null;

watch(() => isModalOpen.value, (newValue) => {
  if (!newValue) {
    isEditMode.value = false;
    editData.value = null;
  }
});

const openModal = (wallet) => {
  if (wallet) {
    isEditMode.value = true;
    editData.value = JSON.parse(JSON.stringify(wallet));
  } else {
    isEditMode.value = false;
    editData.value = null;
  }
  isModalOpen.value = true;
};

const addWallet = async (walletData) => {
  try {
    isLoading.value = true;
    await walletService.createWallet(walletData);
    logInfo('Wallet agregada correctamente');
    isModalOpen.value = false;
  } catch (error) {
    logError('Error al agregar wallet:', error);
  } finally {
    isLoading.value = false;
  }
};

const updateWallet = async (walletData) => {
  try {
    isLoading.value = true;
    if (!editData.value?.id) {
      throw new Error('ID de wallet no encontrado');
    }
    await walletService.updateWallet(editData.value.id, walletData);
    logInfo('Wallet actualizada correctamente');
    isModalOpen.value = false;
  } catch (error) {
    logError('Error al actualizar wallet:', error);
  } finally {
    isLoading.value = false;
  }
};

const deleteWallet = async (id) => {
  try {
    isLoading.value = true;
    await walletService.deleteWallet(id);
    logInfo('Wallet eliminada correctamente');
  } catch (error) {
    logError('Error al eliminar wallet:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  unsubscribe = walletService.subscribeToWallets((updatedWallets) => {
    // Ordenar las wallets por fecha de creación
    wallets.value = updatedWallets.sort((a, b) => {
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <CardLayout class="mt-[30px]">
    <header class="flex items-center justify-between">
      <h2 class="text-colorTextBlack dark:text-white font-semibold text-[20px] md:text-[30px]">
        Formas de pago
      </h2>
      <button
          type="button"
          @click="openModal(null)"
          class="gap-2.5 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-500"
      >
        <Plus />
        <span class="hidden md:block">Agregar Billetera</span>
      </button>
    </header>

    <main class="grid grid-cols-1 lg:grid-cols-2 mt-[30px] gap-[30px]">
      <CardWallets
          v-for="wallet in wallets"
          :key="wallet.id"
          :paymentMethod="wallet.paymentMethod"
          :network="wallet.network"
          :walletAddress="wallet.walletAddress"
          :qrImage="wallet.qrImage"
          :onEdit="() => openModal(wallet)"
          :onDelete="() => deleteWallet(wallet.id)"
      />
    </main>

    <AddWalletModal
        v-model="isModalOpen"
        :isEditMode="isEditMode"
        :editData="editData"
        :isLoading="isLoading"
        @add-wallet="addWallet"
        @update-wallet="updateWallet"
    />
  </CardLayout>
</template>

<style scoped>
</style>