<script setup>
import {ref, computed, onMounted, watch, onUnmounted} from 'vue';
import {Camera, Loader2, MoveRight, UserCircle2} from "lucide-vue-next";
import TelegramIcon from "@/assets/icons/TelegramIcon.vue";
import WhatsAppIcon from "@/assets/icons/WhatsAppIcon.vue";
import InstagramIcon from "@/assets/icons/InstagramIcon.vue";
import XIcon from "@/assets/icons/XIcon.vue";
import BaseInput from "./BaseInput.vue";
import SecureLS from 'secure-ls';
import {userService} from '@/services/user_service';
import {useToast} from 'vue-toastification';

const toast = useToast();
const ls = new SecureLS({encodingType: 'aes'});
const userRole = computed(() => ls.get('user_role') || '');
const showSocialMedia = computed(() => userRole.value !== 'socio');

const isEditable = ref(false);
const photoLoading = ref(false);
const emailLoading = ref(false);
const debouncedUpdate = ref(null);

const userData = ref({
  photoURL: null,
  nombre: '',
  email: '',
  telefono: '',
  pais: '',
  telegram: '',
  whatsapp: '',
  instagram: '',
  xsocial: '',
  updated_at: ''
});

const loadUserData = async () => {
  try {
    const userResponse = await userService.getUserData();

    if (userResponse.success && userResponse.data) {
      Object.keys(userData.value).forEach(key => {
        if (userResponse.data[key] !== undefined) {
          userData.value[key] = userResponse.data[key];
        }
      });
    } else {
      throw new Error('No se pudieron cargar los datos');
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
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
    console.error('Error al actualizar foto:', error);
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
    console.error('Error al enviar correo:', error);
    toast.error('Error al enviar el correo');
  } finally {
    emailLoading.value = false;
  }
};

// Watch con debounce para actualizaciones automáticas
watch(userData, (newValue, oldValue) => {
  if (!isEditable.value) return;
  if (oldValue.contacto === '') return;

  if (debouncedUpdate.value) {
    clearTimeout(debouncedUpdate.value);
  }

  debouncedUpdate.value = setTimeout(async () => {
    try {
      const result = await userService.updateUserProfile(newValue);
      if (result.success) {
        toast.success('Cambios guardados');
      }
    } catch (error) {
      console.error('Error en actualización automática:', error);
      toast.error('Error al guardar los cambios');
    }
  }, 3000);
}, {deep: true});

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
                <div v-if="isEditable"
                     class="absolute inset-0 flex items-center justify-center hover:bg-black hover:bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <Camera class="text-white"/>
                </div>
                <div
                    v-if="photoLoading"
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                >
                  <Loader2 class="animate-spin text-white"/>
                </div>
              </label>
            </template>
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
                  <Loader2 class="animate-spin text-white"/>
                </div>
              </label>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="font-bold text-[16px] md:text-[20px] text-colorTextBlack dark:text-white">
            {{ userRole === 'admin' && !userData.nombre ? 'Administrador del Sistema' : userData.nombre }}
          </h3>
          <span class="text-[10px] md:text-[16px] text-colorGray2">
            {{ userRole === 'admin' && !userData.email ? 'Agregar un Correo' : userData.email }}
          </span>
        </div>
      </div>
      <label class="inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            v-model="isEditable"
            class="sr-only peer"
        >
        <div
            class="relative w-14 h-7 bg-gray-200 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-colorBgButton"></div>
      </label>
    </header>

    <div class="mt-[30px]">
      <div class="grid grid-cols-4 gap-[20px] md:gap-[30px]">
        <div class="col-span-4 lg:col-span-2">
          <BaseInput
              v-model="userData.nombre"
              label="Nombre"
              placeholder="Administrador del Sistema"
              :disabled="!isEditable"
          />
        </div>

        <div class="col-span-4 lg:col-span-2">
          <BaseInput
              v-model="userData.email"
              label="Email"
              type="email"
              placeholder="admin@gmail.com"
              :disabled="!isEditable"
              truncate
          />
        </div>

        <div class="w-full col-span-4 grid grid-cols-1 md:grid-cols-3 gap-[20px] md:gap-[30px]">
          <BaseInput
              v-model="userData.telefono"
              label="Teléfono"
              placeholder="Introduce tu número de teléfono"
              :disabled="!isEditable"
          />

          <BaseInput
              v-model="userData.pais"
              label="País"
              placeholder="Introduce el nombre de tu país"
              :disabled="!isEditable"
          />

          <BaseInput
              :model-value="userData.email"
              label="Actualizar Contraseña"
              placeholder="Agregar un Correo"
              type="email"
              disabled
          >
            <template #suffix>
              <button
                  type="button"
                  @click="handlePasswordReset"
                  :disabled="emailLoading"
                  class="hover:scale-125 transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:hover:scale-100"
              >
                <Loader2 v-if="emailLoading" class="animate-spin"/>
                <MoveRight v-else/>
              </button>
            </template>
          </BaseInput>
        </div>

        <template v-if="showSocialMedia">
          <h2 class="text-colorTextBlack dark:text-white text-[22px] col-span-4 font-bold">Redes Sociales</h2>

          <div class="w-full col-span-4 grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[30px]">
            <BaseInput
                v-model="userData.telegram"
                placeholder="https://t.me/profile"
                :disabled="!isEditable"
            >
              <template #icon>
                <TelegramIcon/>
              </template>
            </BaseInput>

            <BaseInput
                v-model="userData.whatsapp"
                placeholder="https://wa.me/message/contact"
                :disabled="!isEditable"
            >
              <template #icon>
                <WhatsAppIcon/>
              </template>
            </BaseInput>

            <BaseInput
                v-model="userData.instagram"
                placeholder="https://i.me/profile"
                :disabled="!isEditable"
            >
              <template #icon>
                <InstagramIcon/>
              </template>
            </BaseInput>

            <BaseInput
                v-model="userData.xsocial"
                placeholder="https://x.me/profile"
                :disabled="!isEditable"
            >
              <template #icon>
                <XIcon/>
              </template>
            </BaseInput>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>