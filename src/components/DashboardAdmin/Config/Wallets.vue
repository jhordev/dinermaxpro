<script setup>
import { ref } from 'vue';
import { Plus } from "lucide-vue-next";
import CardWallets from "@/components/DashboardAdmin/Config/CardWallets.vue";
import AddWalletModal from "@/components/DashboardAdmin/Config/AddWalletModal.vue";
import imgQr from '@/assets/img/qr.png';

// Datos de las billeteras
const wallets = ref([
  {
    paymentMethod: "bv",
    network: "Wallet-Tron (TRC20)",
    walletAddress: "12eb5cRuXFwaXwKFsqUFS7yYTFVXwsHak9",
    qrImage: imgQr,
  },
  {
    paymentMethod: "btc",
    network: "Bitcoin",
    walletAddress: "1FzWLkYgFi4QzxZ5kAB6rnn2R5h5KPd5zJ",
    qrImage: imgQr,
  },
]);

const isModalOpen = ref(false);
const isEditMode = ref(false);
const editData = ref(null);

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

const addWallet = (newWallet) => {
  wallets.value.push(newWallet);
};

const updateWallet = (updatedWallet) => {
  const index = wallets.value.findIndex(
      (wallet) => wallet.walletAddress === updatedWallet.walletAddress
  );
  if (index !== -1) {
    wallets.value[index] = { ...updatedWallet };
  }
};
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
        @update:modelValue="isModalOpen = $event"
        @add-wallet="addWallet"
        @update-wallet="updateWallet"
    />
  </section>
</template>
