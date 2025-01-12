<script setup>
import { computed } from 'vue';
import { Users, Wallet, WalletCards, DollarSign, X, CheckCircle2, XCircle, Crown, Star, Trophy, Users2, Coins } from 'lucide-vue-next';
import { logInfo } from '@/utils/logger';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  socioData: {
    type: Object,
    default: () => ({
      totalUsuarios: 0,
      fondos: 0,
      retirados: 0
    })
  },
  membershipData: {
    type: Object,
    required: true,
    default: () => ({
      active: 0,
      inactive: 0,
    }),
  },
  subscriptionPlans: {
    type: Array,
    required: true,
    default: () => [
      { name: "Plan Básico", count: 0 },
      { name: "Plan Estándar", count: 0 },
      { name: "Plan Pro", count: 0 },
    ],
  },
  referralData: {
    type: Object,
    required: true,
    default: () => ({
      referred: 0,
      earnings: 0,
    }),
  },
  socioNombre: {
    type: String,
    required: true,
    default: ''
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  logInfo('Modal de información de socio cerrado');
  emit('close');
};

const formatCurrency = (value) => {
  return `${Number(value).toFixed(2)} USDT`;
};

const totalFondos = computed(() => {
  return Number((props.socioData.fondos - props.socioData.retirados).toFixed(2));
});

const cardsData = computed(() => [
  {
    title: "Total de Usuarios",
    value: new Intl.NumberFormat().format(props.socioData.totalUsuarios),
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    title: "Fondos",
    value: formatCurrency(props.socioData.fondos),
    icon: Wallet,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    title: "Fondos retirados",
    value: formatCurrency(props.socioData.retirados),
    icon: WalletCards,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    title: "Total Fondos",
    value: formatCurrency(totalFondos.value),
    icon: DollarSign,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  }
]);
</script>

<template>
  <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm"
      @click="closeModal"
  >
    <div
        class="relative w-full max-w-6xl p-4 mx-auto"
        @click.stop
    >
      <div class="relative w-full overflow-hidden bg-bgModal rounded-2xl shadow-xl animate-modal-up">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <Users2 class="w-6 h-6 text-blue-500" />
            </div>
            <h3 class="text-xl font-bold text-white">
              Información {{ props.socioNombre }}
            </h3>
          </div>
          <button
              class="p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/10"
              @click="closeModal"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
                v-for="(card, index) in cardsData"
                :key="index"
                class="group transition-all duration-200 ease-in-out hover:scale-[1.02]"
            >
              <div class="p-6 rounded-xl bg-white/5 backdrop-blur-sm shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-300">
                    {{ card.title }}
                  </h4>
                  <div :class="[card.bgColor, 'p-2 rounded-lg transition-colors duration-200']">
                    <component
                        :is="card.icon"
                        class="w-5 h-5"
                        :class="card.color"
                    />
                  </div>
                </div>
                <p class="text-2xl font-bold tracking-tight text-white">
                  {{ card.value }}
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div class="p-6 rounded-xl bg-white/5 backdrop-blur-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-yellow-500/10 rounded-lg">
                  <Crown class="w-5 h-5 text-yellow-500" />
                </div>
                <h3 class="text-lg font-semibold text-white">
                  Estados de Membresía
                </h3>
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 transition-colors rounded-lg bg-white/5">
                  <div class="flex items-center gap-3">
                    <CheckCircle2 class="w-5 h-5 text-green-500" />
                    <span class="text-gray-300">Activas</span>
                  </div>
                  <span class="text-lg font-semibold text-green-500">
                    {{ membershipData.active }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-4 transition-colors rounded-lg bg-white/5">
                  <div class="flex items-center gap-3">
                    <XCircle class="w-5 h-5 text-red-500" />
                    <span class="text-gray-300">Inactivas</span>
                  </div>
                  <span class="text-lg font-semibold text-red-500">
                    {{ membershipData.inactive }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-xl bg-white/5 backdrop-blur-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-blue-500/10 rounded-lg">
                  <Star class="w-5 h-5 text-blue-500" />
                </div>
                <h3 class="text-lg font-semibold text-white">
                  Suscriptores por plan
                </h3>
              </div>
              <div class="space-y-4">
                <div
                    v-for="(plan, index) in subscriptionPlans"
                    :key="index"
                    class="flex items-center justify-between p-4 transition-colors rounded-lg bg-white/5"
                >
                  <div class="flex items-center gap-3">
                    <Trophy class="w-5 h-5" :class="[
                      index === 0 ? 'text-amber-600' :
                      index === 1 ? 'text-gray-400' :
                      'text-yellow-400'
                    ]" />
                    <span class="text-gray-300">{{ plan.name }}</span>
                  </div>
                  <span class="text-lg font-semibold text-blue-500">{{ plan.count }}</span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-xl bg-white/5 backdrop-blur-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-purple-500/10 rounded-lg">
                  <Users2 class="w-5 h-5 text-purple-500" />
                </div>
                <h3 class="text-lg font-semibold text-white">
                  Referidos
                </h3>
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 transition-colors rounded-lg bg-white/5">
                  <div class="flex items-center gap-3">
                    <Users class="w-5 h-5 text-purple-500" />
                    <span class="text-gray-300">Referidos</span>
                  </div>
                  <span class="text-lg font-semibold text-purple-500">
                    {{ referralData.referred }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-4 transition-colors rounded-lg bg-white/5">
                  <div class="flex items-center gap-3">
                    <Coins class="w-5 h-5 text-green-500" />
                    <span class="text-gray-300">Ganancias</span>
                  </div>
                  <span class="text-lg font-semibold text-green-500">
                    ${{ referralData.earnings }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes modalUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-modal-up {
  animation: modalUp 0.3s ease-out;
}
</style>