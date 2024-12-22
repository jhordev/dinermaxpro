<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { ChevronDown, MoveRight, Camera, UserCircle2, Loader2 } from 'lucide-vue-next';
import { userService } from '@/services/user_service';
import { logError, logInfo, logDebug } from '@/utils/logger.js';
import { useToast } from 'vue-toastification';

const toast = useToast();
const isEditable = ref(false);
const photoLoading = ref(false);
const emailLoading = ref(false);
const debouncedUpdate = ref(null);

const userData = ref({
  nombre: '',
  wallet: '',
  sexo: '',
  telefono: '',
  pais: '',
  email: '',
  referido: '',
  photoURL: '',
  updated_at: ''
});

const loadUserData = async () => {
  try {
    const [userResponse, referrerName] = await Promise.all([
      userService.getUserData(),
      userService.getReferrerName()
    ]);

    if (userResponse.success && userResponse.data) {
      Object.keys(userData.value).forEach(key => {
        if (userResponse.data[key] !== undefined) {
          userData.value[key] = userResponse.data[key];
        }
      });
      userData.value.referido = referrerName;
      logInfo('Datos de usuario y referido cargados correctamente');
    } else {
      throw new Error('No se pudieron cargar los datos');
    }
  } catch (error) {
    logError('Error al cargar datos:', error);
    toast.error('Error al cargar los datos del perfil');
  }
};

const handlePhotoChange = async (event) => {
  if (!isEditable.value) return;

  const file = event.target.files[0];
  if (!file) return;

  photoLoading.value = true;
  try {
    const result = await userService.updateProfilePhoto(file);
    if (result.success) {
      userData.value.photoURL = result.photoURL;
      toast.success('Foto actualizada correctamente');
    }
  } catch (error) {
    logError('Error al actualizar foto:', error);
    toast.error('Error al actualizar la foto');
  } finally {
    photoLoading.value = false;
  }
};

const handlePasswordReset = async () => {
  if (!userData.value.email) return;

  emailLoading.value = true;
  try {
    const result = await userService.sendPasswordResetEmail(userData.value.email);
    if (result.success) {
      toast.success('Se ha enviado un correo para restablecer tu contraseña');
    }
  } catch (error) {
    logError('Error al enviar correo:', error);
    toast.error('Error al enviar el correo');
  } finally {
    emailLoading.value = false;
  }
};

// Watch con debounce mejorado
watch(userData, (newValue, oldValue) => {
  if (!isEditable.value) return;

  // Evitar actualizaciones innecesarias al cargar datos iniciales
  if (oldValue.nombre === '') return;

  // Cancelar el temporizador anterior
  if (debouncedUpdate.value) {
    clearTimeout(debouncedUpdate.value);
  }

  // Crear nuevo temporizador
  debouncedUpdate.value = setTimeout(async () => {
    try {
      const result = await userService.updateUserProfile(newValue);
      if (result.success) {
        logInfo('Perfil actualizado automáticamente');
        toast.success('Cambios guardados');
      }
    } catch (error) {
      logError('Error en actualización automática:', error);
      toast.error('Error al guardar los cambios');
    }
  }, 3000); // 3 segundos de espera
}, { deep: true });

// Limpiar el temporizador al desmontar
onUnmounted(() => {
  if (debouncedUpdate.value) {
    clearTimeout(debouncedUpdate.value);
  }
});

onMounted(loadUserData);
</script>

<template>
  <section class="rounded-[15px] bg-bgCardLigth p-5 md:p-[50px] shadow-default dark:bg-bgDashboardDark w-full">
    <header class="flex justify-between items-center">
      <div class="flex items-center gap-3 md:gap-5">
        <div class="w-[60px] md:w-[100px]">
          <input
              type="file"
              accept="image/*"
              class="hidden"
              id="photoInput"
              @change="handlePhotoChange"
              :disabled="!isEditable"
          >
          <div class="relative w-full aspect-square">
            <!-- Cuando existe foto -->
            <template v-if="userData.photoURL">
              <label
                  for="photoInput"
                  :class="[
              'block w-full h-full relative',
              isEditable ? 'cursor-pointer' : 'cursor-not-allowed'
            ]"
              >
                <img
                    :src="userData.photoURL"
                    alt="profile"
                    class="w-full h-full object-cover rounded-full"
                >
                <div v-if="isEditable" class="absolute inset-0 flex items-center justify-center hover:bg-black hover:bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <Camera class="text-white" />
                </div>
                <div
                    v-if="photoLoading"
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                >
                  <Loader2 class="animate-spin text-white" />
                </div>
              </label>
            </template>
            <!-- Cuando no existe foto -->
            <template v-else>
              <label
                  for="photoInput"
                  :class="[
              'block w-full h-full',
              isEditable ? 'cursor-pointer' : 'cursor-not-allowed'
            ]"
              >
                <UserCircle2
                    class="w-full h-full text-gray-400 dark:text-gray-500"
                />
                <div
                    v-if="photoLoading"
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                >
                  <Loader2 class="animate-spin text-white" />
                </div>
              </label>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="font-bold text-[16px] md:text-[20px] text-colorTextBlack dark:text-white">
            {{ userData.nombre }}
          </h3>
          <span class="text-[10px] md:text-[16px] text-colorGray2">{{ userData.email }}</span>
        </div>
      </div>
      <label class="inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            v-model="isEditable"
            class="sr-only peer"
        >
        <div class="relative w-14 h-7 bg-gray-200 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-colorBgButton"></div>
      </label>
    </header>

    <div class="mt-[30px]">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-[20px] md:gap-[30px]">
        <div class="col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Nombre</label>
          <input
              v-model="userData.nombre"
              type="text"
              placeholder="Juan Perez"
              :disabled="!isEditable"
              :class="[
              'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
              !isEditable ? 'opacity-75 cursor-not-allowed' : ''
            ]"
          >
        </div>

        <div class="col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Billetera (red: TRC20)</label>
          <input
              v-model="userData.wallet"
              type="text"
              placeholder="12eb5cRuXFwaXwKFsqUFS7yYTFVXwsHak9"
              :disabled="!isEditable"
              :class="[
              'truncate pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
              !isEditable ? 'opacity-75 cursor-not-allowed' : ''
            ]"
          >
        </div>

        <div class="w-full col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-[20px] md:gap-[30px]">
          <div class="w-full col-span-1 flex flex-col gap-2.5">
            <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Sexo</label>
            <div class="relative">
              <select
                  v-model="userData.sexo"
                  :disabled="!isEditable"
                  :class="[
                  'cursor-pointer pl-5 w-full py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal appearance-none',
                  !isEditable ? 'opacity-75 cursor-not-allowed' : ''
                ]"
              >
                <option value="" selected class="bg-bgCardLigth dark:bg-bgDashboardDark text-colorTextBlack dark:text-white">
                  Seleccione su sexo
                </option>
                <option value="MAS" class="bg-bgCardLigth dark:bg-bgDashboardDark text-colorTextBlack dark:text-white">
                  Masculino
                </option>
                <option value="FEM" class="bg-bgCardLigth dark:bg-bgDashboardDark text-colorTextBlack dark:text-white">
                  Femenino
                </option>
              </select>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown />
              </span>
            </div>
          </div>

          <div class="col-span-1 flex flex-col gap-2.5">
            <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Teléfono</label>
            <input
                v-model="userData.telefono"
                type="text"
                placeholder="+51 959 659 502"
                :disabled="!isEditable"
                :class="[
                'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
            >
          </div>

          <div class="col-span-1 flex flex-col gap-2.5">
            <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">País</label>
            <input
                v-model="userData.pais"
                type="text"
                placeholder="Panamá"
                :disabled="!isEditable"
                :class="[
                'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
            >
          </div>
        </div>

        <div class="col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Referido por</label>
          <input
              v-model="userData.referido"
              type="text"
              disabled
              :class="[
              'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal opacity-75 cursor-not-allowed'
            ]"
          >
        </div>

        <div class="col-span-2 flex flex-col gap-2.5">
          <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Actualizar Contraseña</label>
          <div class="flex items-center justify-between pr-5 gap-8 text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal">
            <input
                :value="userData.email"
                type="email"
                disabled
                class="w-full pl-5 py-3 md:py-4 bg-transparent outline-none opacity-75 cursor-not-allowed"
            >
            <button
                type="button"
                @click="handlePasswordReset"
                :disabled="emailLoading"
                class="hover:scale-125 transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:hover:scale-100"
            >
              <Loader2 v-if="emailLoading" class="animate-spin" />
              <MoveRight v-else />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>