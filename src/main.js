import './assets/main.css'; // CSS global, como Tailwind CSS si lo usas
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Importa Pinia
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia(); // Crea la instancia de Pinia
app.use(pinia); // Usa Pinia
app.use(router); // Usa el enrutador

app.mount('#app');
