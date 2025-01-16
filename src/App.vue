<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { userService } from '@/services/user_service';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase_config';
import { Analytics } from '@vercel/analytics/vue';
import BlockedAccountDialog from '@/dialogs/BlockedAccountDialog.vue';

const showBlockedDialog = ref(false);
let unsubscribe = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      unsubscribe = userService.subscribeToUserStatus(user.uid, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          showBlockedDialog.value = userData.estado === 'inactivo';
        }
      });
    } else {
      showBlockedDialog.value = false;
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <Analytics />
  <div>
    <RouterView />
    <BlockedAccountDialog v-if="showBlockedDialog" />
  </div>
</template>

<style scoped>
</style>