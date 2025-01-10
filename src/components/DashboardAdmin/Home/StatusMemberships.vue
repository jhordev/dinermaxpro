<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '@/services/firebase_config';
import { logInfo, logError } from '@/utils/logger';
import SecureLS from 'secure-ls';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const ls = new SecureLS({ encodingType: 'aes' });
const activeInvestments = ref(0);
const inactiveInvestments = ref(0);

const data = ref({
  labels: ['Activas', 'No Activas'],
  datasets: [
    {
      label: 'Estado de Membresías',
      data: [0, 0],
      backgroundColor: ['#7586FF', '#FF49A0'],
      borderWidth: 0,
      cutout: '60%',
    },
  ],
});

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Distribución de Membresías',
    },
  },
};

const isInvestmentActive = (investment) => {
  try {
    if (!investment.expirationDate || !investment.expirationDate.seconds) {
      return false;
    }

    const expirationDate = new Date(investment.expirationDate.seconds * 1000);
    const now = new Date();

    return expirationDate > now;
  } catch (error) {
    logError('Error al procesar inversión: ' + error.message);
    return false;
  }
};

let unsubscribe = null;

onMounted(async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    logError('No hay usuario autenticado');
    return;
  }

  const userRole = ls.get('user_role');
  logInfo('Rol del usuario:', userRole);

  const investmentsRef = collection(db, 'investments');
  const usersRef = collection(db, 'users');

  unsubscribe = onSnapshot(query(investmentsRef), async (investmentsSnapshot) => {
    try {
      const usersSnapshot = await getDocs(query(usersRef));
      const validUserIds = new Set();

      // Obtener IDs de usuarios válidos según el rol
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userRole === 'socio' && userData.socioId === currentUser.uid) {
          validUserIds.add(userDoc.id);
        } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
          validUserIds.add(userDoc.id);
        }
      });

      let active = 0;
      let inactive = 0;

      investmentsSnapshot.forEach((doc) => {
        const investment = doc.data();
        // Solo procesar inversiones aprobadas
        if (investment.status === 'approved' && validUserIds.has(investment.userId)) {
          if (isInvestmentActive(investment)) {
            active++;
          } else {
            inactive++;
          }
        }
      });

      activeInvestments.value = active;
      inactiveInvestments.value = inactive;

      data.value = {
        ...data.value,
        datasets: [{
          ...data.value.datasets[0],
          data: [active, inactive]
        }]
      };

      logInfo(`Inversiones activas aprobadas: ${active}, Inversiones inactivas aprobadas: ${inactive}`);
    } catch (error) {
      logError('Error al procesar datos: ' + error.message);
    }
  }, (error) => {
    logError('Error al obtener inversiones: ' + error.message);
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <CardLayout>
    <div class="flex justify-between items-center">
      <h2 class="text-[18px] md:text-[30px] text-colorTextBlack dark:text-white tracking-[3px] font-bold">
        Estados de Membresía
      </h2>
    </div>

    <div class="mt-6 flex flex-col items-center">
      <div class="lg:w-[400px]">
        <Pie :data="data" :options="options" />
      </div>
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Total de inversiones aprobadas: {{ activeInvestments + inactiveInvestments }}
        </p>
      </div>
    </div>
  </CardLayout>
</template>

<style scoped>
</style>