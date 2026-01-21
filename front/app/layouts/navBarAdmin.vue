<script setup>
import { useRoute } from "vue-router";
import { ref } from "vue";
import GestioWeights from "@/utils/components/admin/GestioWeights.vue";

const route = useRoute();
const mostrarModalWeights = ref(false);

const isActive = (path) => {
  return route.path === path;
};
</script>
<template>
  <div id="navBar">
    <div id="btns">
      <NuxtLink
        to="/admin/paginaPrincipal-Admin"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive('/admin/paginaPrincipal-Admin') }"
      >
        <button @click="navigate">
          <img src="/img/navBarAdmin/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink
        to="/admin/gestioTallers-Admin"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive('/admin/gestioTallers-Admin') }"
      >
        <button @click="navigate">
          <img src="/img/navBarAdmin/backpack.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/admin/gestioPeticions-Admin"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive('/admin/gestioPeticions-Admin') }"
      >
        <button @click="navigate">
          <img src="/img/navBarAdmin/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/admin/gestioCentres-Admin"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive('/admin/gestioCentres-Admin') }"
      >
        <button @click="navigate">
          <img src="/img/navBarAdmin/academic-cap.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/admin/gestioInformes-Admin"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive('/admin/gestioInformes-Admin') }"
      >
        <button @click="navigate">
          <img src="/img/navBarAdmin/document-alt.png" alt="" />
        </button>
      </NuxtLink>

      <br />
      <button @click="mostrarModalWeights = true" title="Configurar criteris">
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <GestioWeights v-if="mostrarModalWeights" @close="mostrarModalWeights = false" />
  </div>
</template>
<style>
#navBar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  height: 470px;
  background-color: #3949ab;
  padding: 10px;
  border-radius: 20px;
  margin-top: 30px;
  margin-left: 30px;
}

#btns {
  margin-top: 10px;
}

#btns button {
  width: 50px;
  height: 50px;
  background-color: transparent;
  /* Fondo inicial transparente */
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background-color 0.3s ease, padding 0.3s ease, transform 0.3s ease;
}

#btns button img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

#btns button i {
  font-size: 28px;
  color: white;
  transition: transform 0.3s ease;
}

#btns button:hover i {
  transform: rotate(90deg);
}
</style>
