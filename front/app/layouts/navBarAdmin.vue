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
      <NuxtLink to="/admin" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " data-tooltip="Pàgina Principal" :class="{ 'btn-activo': isActive('/admin') }">
          <img src="/img/navBarAdmin/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink to="/admin/gestioTallers" custom v-slot="{ navigate }">
        <button @click="navigate()" data-tooltip="Gestió Tallers"
          :class="{ 'btn-activo': isActive('/admin/gestioTallers') }">
          <img src="/img/navBarAdmin/backpack.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/admin/gestioPeticions" custom v-slot="{ navigate }">
        <button @click="navigate()" data-tooltip="Gestió Peticions"
          :class="{ 'btn-activo': isActive('/admin/gestioPeticions') }">
          <img src="/img/navBarAdmin/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/admin/gestioCentres" custom v-slot="{ navigate }">
        <button @click="navigate()" data-tooltip="Informació Centres"
          :class="{ 'btn-activo': isActive('/admin/gestioCentres') }">
          <img src="/img/navBarAdmin/academic-cap.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/admin/gestioInformes" custom v-slot="{ navigate }">
        <button @click="navigate()" data-tooltip="Gestió Informes"
          :class="{ 'btn-activo': isActive('/admin/gestioInformes') }">
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
/* Desktop: Vertical sidebar (default) */
#navBar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  height: auto;
  min-height: 100%;
  background-color: #3949ab;
  padding: 10px;
  border-radius: 20px;
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 30px;
  position: relative;

}



#btns {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

#btns button img.icon-white {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
}

#btns button i {
  font-size: 28px;
  color: white;
  transition: transform 0.3s ease;
}

#btns button:hover i {
  transform: rotate(90deg);
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



/* RESPONSIVE: Pantallas grandes */
@media (min-width: 1280px) and (max-width: 1919px) {
  #navBar {
    width: 80px;
    height: auto;
    min-height: 100%;
    margin-top: 40px;
    margin-bottom: 40px;
    margin-left: 40px;
    padding: 8px;
  }

  #btns {
    gap: 4px;
    margin-top: 6px;
  }

  #btns button {
    width: 55px;
    height: 55px;
  }

  #btns button img {
    width: 45px;
    height: 45px;
  }

  #btns button i {
    font-size: 30px;
  }
}

/* RESPONSIVE: Pantallas extra grandes */
@media (min-width: 1920px) {
  #navBar {
    width: 90px;
    height: auto;
    min-height: 100%;
    margin-top: 50px;
    margin-bottom: 50px;
    margin-left: 50px;
    padding: 15px;
  }

  #btns {
    margin-top: 15px;
    gap: 18px;
  }

  #btns button {
    width: 60px;
    height: 60px;
  }

  #btns button img {
    width: 50px;
    height: 50px;
  }

  #btns button i {
    font-size: 32px;
  }

  #btns button:hover::after {
    font-size: 13px;
    padding: 7px 12px;
  }
}
</style>
