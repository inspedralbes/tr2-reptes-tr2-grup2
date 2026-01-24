import { createApp } from "vue";
import App from "./app.vue";
import { createPinia } from "pinia";
import router from "./router";
import "bulma/css/bulma.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

// Registrar SweetAlert2 como una propiedad global
app.config.globalProperties.$Swal = Swal;

// --- Muntatge ---
app.mount("#app");
