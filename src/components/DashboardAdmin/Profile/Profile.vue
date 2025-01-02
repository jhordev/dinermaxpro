<script setup>
import { ref } from 'vue';
import {Camera, ChevronDown, Loader2, MoveRight, UserCircle2} from "lucide-vue-next";
import TelegraIcon from "@/components/DashboardAdmin/Profile/TelegraIcon.vue";
import WhatsAppIcon from "@/components/DashboardAdmin/Profile/WhatsAppIcon.vue";
import CardLayout from "@/layouts/CardLayout.vue";
import XIcon from "@/components/DashboardAdmin/Profile/XIcon.vue";
import InstagramIcon from "@/components/DashboardAdmin/Profile/InstagramIcon.vue";

const isEditable = ref(false);
const photoLoading = ref(false);

const userData = ref({
  photoURL: null,
  contacto: '',
  email: '',
  telefono: '',
  pais: '',
  telegram: '',
  whatsaspp: '',
  instagram: '',
  xsocial: '',
});

const handlePhotoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    photoLoading.value = true;
    reader.onload = (e) => {
      userData.value.photoURL = e.target.result;
      photoLoading.value = false;
    };
    reader.readAsDataURL(file);
  }
};

const handlePasswordReset = () => {
  alert('Función para actualizar la contraseña en proceso');
};
</script>

<template>
<section class="rounded-[15px] bg-bgCardLigth p-5 md:p-[50px] shadow-default dark:bg-bgDashboardDark w-full">
  <header class="flex justify-between items-center ">
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
          jhordy
        </h3>
        <span class="text-[10px] md:text-[16px] text-colorGray2">jhordy@gmail.com</span>
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
    <div class="grid grid-cols-4 gap-[20px] md:gap-[30px]">
      <div class="col-span-4 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Contacto</label>
        <input
            v-model="userData.contacto"
            type="text"
            placeholder="Juan Perez"
            :disabled="!isEditable"
            :class="[
              'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
              !isEditable ? 'opacity-75 cursor-not-allowed' : ''
            ]"
        >
      </div>

      <div class="col-span-4 lg:col-span-2 flex flex-col gap-2.5">
        <label class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]">Email</label>
        <input
            v-model="userData.email"
            type="email"
            placeholder="admin@gmail.com"
            :disabled="!isEditable"
            :class="[
              'truncate pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
              !isEditable ? 'opacity-75 cursor-not-allowed' : ''
            ]"
        >
      </div>

      <div class="w-full col-span-4 grid grid-cols-1 md:grid-cols-3 gap-[20px] md:gap-[30px]">

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
              placeholder="Ecuador"
              :disabled="!isEditable"
              :class="[
                'pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
          >
        </div>

        <div class="col-span-1 flex flex-col gap-2.5">
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

      <h2 class="text-colorTextBlack dark:text-white text-[22px] col-span-4 font-bold">Redes Sociales</h2>

      <div class="w-full col-span-4 grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[30px]">
        <div class="flex items-center gap-2.5">
           <svg class="text-colorTextBlack dark:text-white" xmlns="http://www.w3.org/2000/svg" width="35" height="36" viewBox="0 0 35 36" fill="currentColor">
             <path d="M14.2622 27.3094L14.6705 21.1407L25.8705 11.049C26.3664 10.5969 25.7685 10.3782 25.1122 10.7719L11.2872 19.5073L5.30804 17.6115C4.02471 17.2469 4.01013 16.3573 5.59971 15.7157L28.8893 6.73234C29.9539 6.25109 30.9747 6.99484 30.5664 8.62817L26.5997 27.3094C26.3226 28.6365 25.5205 28.9573 24.4122 28.3448L18.3747 23.8823L15.4726 26.6969C15.1372 27.0323 14.8601 27.3094 14.2622 27.3094Z" fill="current"/>
           </svg>
          <input
              v-model="userData.telegram"
              type="text"
              placeholder="https://t.me/profile"
              :disabled="!isEditable"
              :class="[
                'w-full pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
          >
        </div>
        <div class="flex items-center gap-2.5">
          <svg class="text-colorTextBlack dark:text-white" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
            <path d="M18.058 3.02791C10.0955 3.02791 3.60592 9.51749 3.60592 17.48C3.60592 20.0321 4.27676 22.5112 5.53092 24.6987L3.48926 32.1946L11.1455 30.1821C13.2601 31.3342 15.6372 31.9467 18.058 31.9467C26.0205 31.9467 32.5101 25.4571 32.5101 17.4946C32.5101 13.63 31.008 9.99874 28.2809 7.27166C26.9437 5.9214 25.3512 4.85078 23.596 4.12219C21.8409 3.3936 19.9583 3.02161 18.058 3.02791ZM18.0726 5.46333C21.2809 5.46333 24.2851 6.71749 26.5601 8.99249C27.6763 10.1089 28.5613 11.4345 29.1644 12.8934C29.7674 14.3523 30.0768 15.9159 30.0747 17.4946C30.0747 24.1154 24.6788 29.4967 18.058 29.4967C15.8997 29.4967 13.7851 28.9279 11.9476 27.8196L11.5101 27.5717L6.96009 28.7675L8.17051 24.3342L7.87884 23.8675C6.67505 21.9547 6.03794 19.74 6.04134 17.48C6.05592 10.8592 11.4372 5.46333 18.0726 5.46333ZM12.9393 10.8008C12.7059 10.8008 12.3122 10.8883 11.9768 11.2529C11.6559 11.6175 10.708 12.5071 10.708 14.2717C10.708 16.0508 12.0059 17.7571 12.1663 18.005C12.3705 18.2529 14.733 21.8987 18.3643 23.4446C19.2247 23.8383 19.8955 24.0571 20.4205 24.2175C21.2809 24.4946 22.0684 24.4508 22.6955 24.3633C23.3955 24.2612 24.8247 23.4883 25.1309 22.6425C25.4372 21.7967 25.4372 21.0821 25.3497 20.9217C25.2476 20.7758 25.0143 20.6883 24.6497 20.5279C24.2851 20.3237 22.5059 19.4487 22.1851 19.3321C21.8497 19.2154 21.6455 19.1571 21.3684 19.5071C21.1351 19.8717 20.4351 20.6883 20.2309 20.9217C20.0122 21.1696 19.808 21.1987 19.458 21.0237C19.0788 20.8342 17.9122 20.455 16.5413 19.23C15.4622 18.2675 14.7476 17.0862 14.5288 16.7217C14.3538 16.3717 14.5143 16.1529 14.6893 15.9925C14.8497 15.8321 15.083 15.5696 15.2288 15.3508C15.4184 15.1467 15.4768 14.9862 15.5934 14.7529C15.7101 14.505 15.6518 14.3008 15.5643 14.1258C15.4768 13.9654 14.7476 12.1571 14.4413 11.4425C14.1497 10.7425 13.858 10.83 13.6247 10.8154C13.4205 10.8154 13.1872 10.8008 12.9393 10.8008Z" />
          </svg>
          <input
              v-model="userData.whatsaspp"
              type="text"
              placeholder="https://wa.me/message/contact"
              :disabled="!isEditable"
              :class="[
                'w-full pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
          >
        </div>
        <div class="flex items-center gap-2.5">
          <svg class="text-colorTextBlack dark:text-white" xmlns="http://www.w3.org/2000/svg" width="35" height="36" viewBox="0 0 35 36" fill="currentColor">
            <path d="M11.3753 3.02783H23.6253C28.292 3.02783 32.0837 6.8195 32.0837 11.4862V23.7362C32.0837 25.9795 31.1925 28.1309 29.6063 29.7171C28.02 31.3034 25.8686 32.1945 23.6253 32.1945H11.3753C6.70866 32.1945 2.91699 28.4028 2.91699 23.7362V11.4862C2.91699 9.24288 3.80814 7.09147 5.39438 5.50522C6.98063 3.91898 9.13204 3.02783 11.3753 3.02783ZM11.0837 5.9445C9.69127 5.9445 8.35591 6.49762 7.37135 7.48219C6.38678 8.46675 5.83366 9.80211 5.83366 11.1945V24.0278C5.83366 26.9299 8.18158 29.2778 11.0837 29.2778H23.917C25.3094 29.2778 26.6447 28.7247 27.6293 27.7401C28.6139 26.7556 29.167 25.4202 29.167 24.0278V11.1945C29.167 8.29242 26.8191 5.9445 23.917 5.9445H11.0837ZM25.1566 8.132C25.64 8.132 26.1037 8.32406 26.4456 8.66592C26.7874 9.00778 26.9795 9.47145 26.9795 9.95492C26.9795 10.4384 26.7874 10.902 26.4456 11.2439C26.1037 11.5858 25.64 11.7778 25.1566 11.7778C24.6731 11.7778 24.2094 11.5858 23.8676 11.2439C23.5257 10.902 23.3337 10.4384 23.3337 9.95492C23.3337 9.47145 23.5257 9.00778 23.8676 8.66592C24.2094 8.32406 24.6731 8.132 25.1566 8.132ZM17.5003 10.3195C19.4342 10.3195 21.2889 11.0877 22.6563 12.4552C24.0238 13.8226 24.792 15.6773 24.792 17.6112C24.792 19.545 24.0238 21.3997 22.6563 22.7672C21.2889 24.1346 19.4342 24.9028 17.5003 24.9028C15.5665 24.9028 13.7118 24.1346 12.3443 22.7672C10.9769 21.3997 10.2087 19.545 10.2087 17.6112C10.2087 15.6773 10.9769 13.8226 12.3443 12.4552C13.7118 11.0877 15.5665 10.3195 17.5003 10.3195ZM17.5003 13.2362C16.34 13.2362 15.2272 13.6971 14.4067 14.5176C13.5863 15.338 13.1253 16.4508 13.1253 17.6112C13.1253 18.7715 13.5863 19.8843 14.4067 20.7048C15.2272 21.5252 16.34 21.9862 17.5003 21.9862C18.6606 21.9862 19.7734 21.5252 20.5939 20.7048C21.4144 19.8843 21.8753 18.7715 21.8753 17.6112C21.8753 16.4508 21.4144 15.338 20.5939 14.5176C19.7734 13.6971 18.6606 13.2362 17.5003 13.2362Z" />
          </svg>
          <input
              v-model="userData.instagram"
              type="text"
              placeholder="https://i.me/profile"
              :disabled="!isEditable"
              :class="[
                'w-full pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
          >
        </div>
        <div class="flex items-center gap-2.5">
          <svg class="text-colorTextBlack dark:text-white" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
            <path d="M26.3872 4.48633H30.8599L21.0891 15.6061L32.5837 30.7363H23.5828L16.5347 21.559L8.46866 30.7363H3.99158L14.4435 18.8436L3.41699 4.48633H12.6453L19.0182 12.8747L26.3872 4.48633ZM24.818 28.0705H27.2972L11.2978 7.01216H8.63783L24.818 28.0705Z" />
          </svg>
          <input
              v-model="userData.xsocial"
              type="text"
              placeholder="https://x.me/profile"
              :disabled="!isEditable"
              :class="[
                'w-full pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
                !isEditable ? 'opacity-75 cursor-not-allowed' : ''
              ]"
          >
        </div>
      </div>

    </div>
  </div>
</section>
</template>

<style scoped>
</style>
