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

    <div id="btns" :class="{ active: menuOpen }">
      <NuxtLink to="/centro" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " data-tooltip="Pàgina Principal" :class="{ 'btn-activo': isActive('/centro') }">
          <img src="/img/navBarProfes/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink to="/centro/inscripcionsTallers" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " data-tooltip="Inscripcions Tallers" :class="{
          'btn-activo': isActive('/centro/inscripcionsTalleres'),
        }">
          <img src="/img/navBarProfes/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/centro/estatInscripcionsTallers" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " data-tooltip="Estat Inscripcions" :class="{
          'btn-activo': isActive('/centro/estatInscripcionsTalleres'),
        }">
          <img src="/img/navBarProfes/checkbox.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink to="/centro/tallersFinalitzats" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " data-tooltip="Tallers Finalitzats" :class="{
          'btn-activo': isActive('/centro/tallersFinalitzats'),
        }">
          <img src="/img/navBarProfes/document-alt.png" alt="" />
        </button>
      </NuxtLink>
    </div>
  </div>
</template>
<style>
/* Desktop: Vertical sidebar (default) */
/* Desktop: Vertical sidebar (default) */
#navBar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  height: auto;
  background-color: #3949ab;
  padding: 10px;
  border-radius: 20px;
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 30px;
  position: relative;
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
  margin-top: 20px;
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



/* RESPONSIVE: Pantallas grandes */
@media (min-width: 1280px) and (max-width: 1919px) {
  #navBar {
    width: 80px;
    height: auto;
    min-height: 100%;
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
    height: auto;
    min-height: 100%;
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
