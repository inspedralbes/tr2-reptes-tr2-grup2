<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

const isHome = computed(() => route.path === "/");

const handleLogout = () => {
  localStorage.clear();
  router.push("/");
};
</script>
<template>
  <header>
    <img src="/assets/img/encabezado/consorci-logo.png" alt="Logo Consorci" id="logo-img" />
    <img src="/assets/img/encabezado/consorci-nombre.png" alt="Nombre Consorci" id="nombre-img" />
    <img v-if="!isHome" src="/img/log_out.png" alt="Log Out" id="logout-img" @click="handleLogout" />
  </header>
</template>
<style scoped>
#logo-img {
  height: 60px;
  margin-left: 30px;
  margin-top: 10px;
}

#nombre-img {
  margin-top: 30px;
  height: 30px;
  margin-left: 15px;
}

#logout-img {
  height: 30px;
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

header {
  width: 100vw;
  height: 85px;
  background-color: #283593;
  display: flex;
  align-items: left;
  justify-content: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  left: 0;
  top: 0;
}
</style>
