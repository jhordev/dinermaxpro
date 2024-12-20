<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import CardActivo from "@/components/Dashboard/Shared/CardActivo.vue";
import axios from 'axios';
import btc from "@/assets/img/icons/cripto/btc.svg";
import eth from "@/assets/img/icons/cripto/eth.svg";
import lite from "@/assets/img/icons/cripto/litecoin.svg";
import dash from "@/assets/img/icons/cripto/dash.svg";
import sol from "@/assets/img/icons/cripto/sol.svg";

const cryptoData = ref([]);

const cryptoIcons = {
  BTC: btc,
  ETH: eth,
  LTC: lite,
  DASH: dash,
  SOL: sol
};

const fetchCryptoData = async () => {
  try {
    const url = 'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","LTCUSDT","DASHUSDT","SOLUSDT"]';
    const response = await axios.get(url);

    cryptoData.value = response.data.map((crypto, index) => {
      const symbol = crypto.symbol.replace('USDT', '');
      const currentPrice = parseFloat(crypto.lastPrice);
      const percentageChange = parseFloat(crypto.priceChangePercent);

      return {
        id: index + 1,
        imageSrc: cryptoIcons[symbol],
        name: symbol,
        amount: `$${currentPrice.toFixed(2)}`,
        percentage: `${percentageChange.toFixed(2)}%`,
        isPositive: percentageChange >= 0,
        textColor: percentageChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      };
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);
  }
};

onMounted(() => {
  fetchCryptoData();
  const intervalId = setInterval(fetchCryptoData, 5000);
  onBeforeUnmount(() => {
    clearInterval(intervalId);
  });
});
</script>

<template>
  <section>
    <h3 class="text-[18px] text-colorTextBlack font-semibold dark:text-white">Activos</h3>
    <div class="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-2 gap-y-2 md:gap-x-6 md:gap-y-5">
      <transition-group name="fade" appear>
        <CardActivo
            v-for="crypto in cryptoData"
            :key="crypto.id"
            :imageSrc="crypto.imageSrc"
            :name="crypto.name"
            :amount="crypto.amount"
            :percentage="crypto.percentage"
            :isPositive="crypto.isPositive"
            :textColor="crypto.textColor"
            class="fade-item"
        />
      </transition-group>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-item {
  transition: all 0.5s ease-in-out;
}

.fade-enter-active {
  transition-delay: calc(0.1s * var(--index));
}
</style>