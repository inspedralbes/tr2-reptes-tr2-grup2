import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import "bulma/css/bulma.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

// --- Muntatge ---
app.mount("#app");
