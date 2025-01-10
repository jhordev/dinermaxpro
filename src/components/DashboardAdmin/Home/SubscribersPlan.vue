<script setup>
import CardLayout from "@/layouts/CardLayout.vue";
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '@/services/firebase_config';
import { logInfo, logError } from '@/utils/logger';
import SecureLS from 'secure-ls';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ls = new SecureLS({ encodingType: 'aes' });

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Suscriptores',
      data: [],
      backgroundColor: ['#9F9FF8', '#96E2D6', '#92BFFF'],
    },
  ],
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
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
      const planCounts = new Map();

      // Obtener IDs de usuarios válidos según el rol
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userRole === 'socio' && userData.socioId === currentUser.uid) {
          validUserIds.add(userDoc.id);
        } else if (userRole === 'admin' && !userData.socioId && userData.role === 'user') {
          validUserIds.add(userDoc.id);
        }
      });

      // Contar planes activos
      investmentsSnapshot.forEach((doc) => {
        const investment = doc.data();
        if (investment.status === 'approved' && validUserIds.has(investment.userId)) {
          const expirationDate = new Date(investment.expirationDate.seconds * 1000);
          const now = new Date();

          if (expirationDate > now) {
            const count = planCounts.get(investment.planName) || 0;
            planCounts.set(investment.planName, count + 1);
          }
        }
      });

      // Actualizar datos del gráfico
      const labels = Array.from(planCounts.keys());
      const data = Array.from(planCounts.values());

      chartData.value = {
        labels,
        datasets: [{
          ...chartData.value.datasets[0],
          data
        }]
      };

      logInfo('Planes activos:', Object.fromEntries(planCounts));
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
    <h3 class="text-[18px] text-colorTextBlack font-semibold dark:text-white">
      Suscriptores por plan
    </h3>
    <Bar
        class="mt-4"
        id="my-chart-id"
        :options="chartOptions"
        :data="chartData"
    />
  </CardLayout>
</template>

<style scoped>
</style>