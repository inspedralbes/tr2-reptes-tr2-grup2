<script setup>
import "@fortawesome/fontawesome-free/css/all.css";
import Encabezado from "@/layouts/encabezado.vue";
import navBarProfes from "@/layouts/navBarProfes.vue";
import navBarAdmin from "@/layouts/navBarAdmin.vue";
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

// Determinar qué navegador mostrar según la ruta
const showNavProfes = computed(() => route.path.startsWith('/centro'));
const showNavAdmin = computed(() => route.path.startsWith('/admin'));
</script>
<template>
  <Encabezado />
  <div class="app-wrapper">
    <navBarProfes v-if="showNavProfes" />
    <navBarAdmin v-if="showNavAdmin" />
    <Transition name="page" mode="out-in">
      <NuxtPage />
    </Transition>
  </div>
</template>
<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
}
.app-wrapper {
  position: relative;
  display: flex;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* SweetAlert2 global */
.swal2-popup,
.swal2-title,
.swal2-html-container,
.swal2-confirm,
.swal2-cancel {
  font-family: Arial, Helvetica, sans-serif !important;
}
</style>
