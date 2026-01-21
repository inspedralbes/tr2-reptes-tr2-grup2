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
      <NuxtLink to="/admin/paginaPrincipal-Admin" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          data-tooltip="Pàgina Principal"
          :class="{ 'btn-activo': isActive('/admin/paginaPrincipal-Admin') }"
        >
          <img src="/img/navBarAdmin/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink to="/admin/gestioTallers-Admin" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          data-tooltip="Gestió Tallers"
          :class="{ 'btn-activo': isActive('/admin/gestioTallers-Admin') }"
        >
          <img src="/img/navBarAdmin/backpack.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/admin/gestioPeticions-Admin" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          data-tooltip="Gestió Peticions"
          :class="{ 'btn-activo': isActive('/admin/gestioPeticions-Admin') }"
        >
          <img src="/img/navBarAdmin/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/admin/gestioCentres-Admin" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          data-tooltip="Informació Centres"
          :class="{ 'btn-activo': isActive('/admin/gestioCentres-Admin') }"
        >
          <img src="/img/navBarAdmin/academic-cap.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/admin/gestioInformes-Admin" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          data-tooltip="Gestió Informes"
          :class="{ 'btn-activo': isActive('/admin/gestioInformes-Admin') }"
        >
          <img src="/img/navBarAdmin/document-alt.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <!-- Este icono de boton es temporal, se debe reemplazar por el icono de mejor calidad de imagen -->
      <NuxtLink to="/admin/gestioPeriodes-Admin" custom v-slot="{ navigate }">
        <button
          @click="navigate"
          data-tooltip="Gestió Períodes"
          :class="{ 'btn-activo': isActive('/admin/gestioPeriodes-Admin') }"
        >
          <img src="/img/centro/calendar.png" alt="" class="icon-white" />
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
  /* Fondo inicial transparente */
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

#btns button img.icon-white {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
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
