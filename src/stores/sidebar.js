import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
    // Estado de visibilidad del sidebar
    const isSidebarOpen = ref(false)

    // Objeto de configuraciones persistente, para agregar más valores fácilmente
    const settings = useStorage('settings', ref({
        selected: 'eCommerce', // valor predeterminado
        page: 'Dashboard', // valor predeterminado
        theme: 'light', // ejemplo de otro dato configurable
        // Puedes agregar más configuraciones aquí según sea necesario
    }))

    // Alternar visibilidad del sidebar
    function toggleSidebar() {
        isSidebarOpen.value = !isSidebarOpen.value
    }

    // Acceder a configuraciones individuales
    function setSetting(key, value) {
        if (settings.value.hasOwnProperty(key)) {
            settings.value[key] = value
        }
    }

    // Obtener configuración específica
    function getSetting(key) {
        return settings.value[key]
    }

    return { isSidebarOpen, toggleSidebar, settings, setSetting, getSetting }
})
