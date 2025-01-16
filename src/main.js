import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Toast, {
    transition: "Vue-Toastification__bounce",
    maxToasts: 3,
    newestOnTop: true
});

app.mount('#app');