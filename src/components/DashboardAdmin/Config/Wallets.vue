<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Plus, Loader2 } from "lucide-vue-next";
import { walletService } from '@/services/wallet_service';
import { logInfo, logError } from '@/utils/logger.js';
import CardWallets from "@/components/DashboardAdmin/Config/CardWallets.vue";
import AddWalletModal from "@/components/DashboardAdmin/Config/AddWalletModal.vue";

const wallets = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const editData = ref(null);
const isLoading = ref(false);
let unsubscribe = null;

const openModal = (wallet) => {
  if (wallet) {
    isEditMode.value = true;
    editData.value = wallet;
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
  } catch (error) {
    logError('Error al agregar wallet:', error);
  } finally {
    isLoading.value = false;
  }
};

const updateWallet = async (walletData) => {
  try {
    isLoading.value = true;
    const id = editData.value.id;
    await walletService.updateWallet(id, walletData);
    logInfo('Wallet actualizada correctamente');
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
    wallets.value = updatedWallets;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <section class="mt-[30px]">
    <header class="flex items-center justify-between">
      <h2 class="text-colorTextBlack dark:text-white font-semibold text-[30px]">Formas de pago</h2>
      <button
          type="button"
          @click="openModal(null)"
          class="gap-2.5 text-white inline-flex items-center bg-colorBgButton hover:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-colorBgButton dark:hover:bg-purple-500">
        <Plus />
        Agregar Billetera
      </button>
    </header>
    <main class="grid grid-cols-2 mt-[30px] gap-[30px]">
      <CardWallets
          v-for="(wallet, index) in wallets"
          :key="index"
          :paymentMethod="wallet.paymentMethod"
          :network="wallet.network"
          :walletAddress="wallet.walletAddress"
          :qrImage="wallet.qrImage"
          :onEdit="() => openModal(wallet)"
      />
    </main>

    <!-- Modal para agregar o editar billetera -->
    <AddWalletModal
        :modelValue="isModalOpen"
        :isEditMode="isEditMode"
        :editData="editData"
        :isLoading="isLoading"
        @update:modelValue="isModalOpen = $event"
        @add-wallet="addWallet"
        @update-wallet="updateWallet"
    />
  </section>
</template>

<style scoped>
</style>