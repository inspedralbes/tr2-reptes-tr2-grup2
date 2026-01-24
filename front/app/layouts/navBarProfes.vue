<script setup>
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const menuOpen = ref(false);

const isActive = (path) => {
  return route.path === path;
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};
</script>
<template>
  <div id="navBar" :class="{ 'menu-open': menuOpen }">
    <!-- Hamburger button (solo visible en móvil/tablet) -->
    <button class="hamburger-btn" @click="toggleMenu" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Overlay para cerrar menú en móvil -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>

    <div id="btns" :class="{ 'active': menuOpen }">
      <NuxtLink to="/centro/paginaPrincipal-Profes" custom v-slot="{ navigate }">
        <button @click="navigate(); closeMenu()" data-tooltip="Pàgina Principal"
          :class="{ 'btn-activo': isActive('/centro/paginaPrincipal-Profes') }">
          <img src="/img/navBarProfes/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink to="/centro/paginaInscripcionsTalleres-Profes" custom v-slot="{ navigate }">
        <button @click="navigate(); closeMenu()" data-tooltip="Inscripcions Tallers" :class="{
          'btn-activo': isActive('/centro/paginaInscripcionsTalleres-Profes'),
        }">
          <img src="/img/navBarProfes/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/centro/paginaEstatInscripcionsTalleres-Profes" custom v-slot="{ navigate }">
        <button @click="navigate(); closeMenu()" data-tooltip="Estat Inscripcions" :class="{
          'btn-activo': isActive(
            '/centro/paginaEstatInscripcionsTalleres-Profes',
          ),
        }">
          <img src="/img/navBarProfes/checkbox.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/centro/paginaTallersFinalitzats-Profes" custom v-slot="{ navigate }">
        <button @click="navigate(); closeMenu()" data-tooltip="Tallers Finalitzats" :class="{
          'btn-activo': isActive('/centro/paginaTallersFinalitzats-Profes'),
        }">
          <img src="/img/navBarProfes/document-alt.png" alt="" />
        </button>
      </NuxtLink>
    </div>
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
  max-height: calc(100vh - 60px);
  background-color: #3949ab;
  padding: 10px;
  border-radius: 20px;
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 30px;
  position: relative;
  overflow-y: auto;
}

/* Hamburger button (oculto en desktop) */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  z-index: 1001;
}

.hamburger-btn span {
  width: 30px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Overlay (oculto en desktop) */
.menu-overlay {
  display: none;
}

#btns {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* RESPONSIVE: Tablet y móvil */
@media (max-width: 1024px) {
  #navBar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 60px !important;
    max-height: 60px !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    padding: 10px 20px !important;
    margin: 0 !important;
    border-radius: 0 !important;
    z-index: 1000;
  }

  /* Mostrar hamburger button */
  .hamburger-btn {
    display: flex;
  }

  /* Animación hamburger cuando está abierto */
  #navBar.menu-open .hamburger-btn span:nth-child(1) {
    transform: rotate(45deg) translate(8px, 8px);
  }

  #navBar.menu-open .hamburger-btn span:nth-child(2) {
    opacity: 0;
  }

  #navBar.menu-open .hamburger-btn span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
  }

  /* Overlay oscuro */
  .menu-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  /* Menú lateral deslizante */
  #btns {
    position: fixed;
    top: 0;
    right: -100%;
    width: 75%;
    max-width: 320px;
    height: 100vh;
    background-color: #3949ab;
    margin: 0;
    padding: 70px 15px 20px;
    transition: right 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  #btns.active {
    right: 0;
  }

  #btns br {
    display: none;
  }

  #btns button {
    width: 100%;
    height: 48px;
    justify-content: flex-start;
    padding-left: 15px;
    margin-bottom: 0;
    border-radius: 8px;
  }

  #btns button img {
    margin-right: 12px;
    width: 28px;
    height: 28px;
  }

  /* Tooltip en móvil: mostrar como texto */
  #btns button::after {
    content: attr(data-tooltip);
    position: static;
    transform: none;
    background: none;
    color: white;
    padding: 0;
    font-size: 15px;
    font-weight: 500;
    box-shadow: none;
    white-space: normal;
  }

  #btns button:hover::after {
    background: none;
  }
}

/* RESPONSIVE: Móvil pequeño */
@media (max-width: 640px) {
  #navBar {
    padding: 10px 15px;
  }

  #btns {
    width: 260px;
    padding: 70px 15px 15px;
  }

  #btns button {
    height: 45px;
    font-size: 14px;
  }

  #btns button img {
    width: 32px;
    height: 32px;
  }
}

/* RESPONSIVE: Pantallas grandes */
@media (min-width: 1280px) and (max-width: 1919px) {
  #navBar {
    width: 80px;
    max-height: calc(100vh - 80px);
    margin-top: 40px;
    margin-bottom: 40px;
    margin-left: 40px;
  }

  #btns {
    gap: 12px;
  }

  #btns button {
    width: 55px;
    height: 55px;
  }

  #btns button img {
    width: 45px;
    height: 45px;
  }
}

/* RESPONSIVE: Pantallas extra grandes */
@media (min-width: 1920px) {
  #navBar {
    width: 90px;
    max-height: calc(100vh - 100px);
    margin-top: 50px;
    margin-bottom: 50px;
    margin-left: 50px;
    padding: 15px;
  }

  #btns {
    margin-top: 15px;
    gap: 16px;
  }

  #btns button {
    width: 60px;
    height: 60px;
  }

  #btns button img {
    width: 50px;
    height: 50px;
  }

  #btns button:hover::after {
    font-size: 13px;
    padding: 7px 12px;
  }
}
</style>
