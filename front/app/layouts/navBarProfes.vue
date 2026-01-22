<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};
</script>
<template>
  <div id="navBar">
    <div id="btns">
      <NuxtLink
        to="/centro/paginaPrincipal-Profes"
        custom
        v-slot="{ navigate }"
      >
        <button
          @click="navigate"
          data-tooltip="Pàgina Principal"
          :class="{ 'btn-activo': isActive('/centro/paginaPrincipal-Profes') }"
        >
          <img src="/img/navBarProfes/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink
        to="/centro/paginaInscripcionsTalleres-Profes"
        custom
        v-slot="{ navigate }"
      >
        <button
          @click="navigate"
          data-tooltip="Inscripcions Tallers"
          :class="{
            'btn-activo': isActive('/centro/paginaInscripcionsTalleres-Profes'),
          }"
        >
          <img src="/img/navBarProfes/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/centro/paginaEstatInscripcionsTalleres-Profes"
        custom
        v-slot="{ navigate }"
      >
        <button
          @click="navigate"
          data-tooltip="Estat Inscripcions"
          :class="{
            'btn-activo': isActive(
              '/centro/paginaEstatInscripcionsTalleres-Profes',
            ),
          }"
        >
          <img src="/img/navBarProfes/checkbox.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/centro/paginaTallersFinalitzats-Profes"
        custom
        v-slot="{ navigate }"
      >
        <button
          @click="navigate"
          data-tooltip="Tallers Finalitzats"
          :class="{
            'btn-activo': isActive('/centro/paginaTallersFinalitzats-Profes'),
          }"
        >
          <img src="/img/navBarProfes/document-alt.png" alt="" />
        </button>
      </NuxtLink>
    </div>
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
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition:
    background-color 0.3s ease,
    padding 0.3s ease,
    transform 0.3s ease;
  position: relative;
}

#btns button img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

#btns button:hover,
#btns button.btn-activo {
  background-color: #5c6bc0;
  padding: 10px;
  transform: scale(1.1);
}

#btns button:hover::after {
  content: attr(data-tooltip);
  position: fixed;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
