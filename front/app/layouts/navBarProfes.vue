<script setup>
import { useRoute } from "vue-router";
import { ref, nextTick } from "vue";
import { createPopper } from "@popperjs/core";

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

// Tooltip Logic
const tooltipRef = ref(null);
const tooltipText = ref("");
const showTooltipState = ref(false);
let popperInstance = null;

const showTooltip = (event, text) => {
  tooltipText.value = text;
  showTooltipState.value = true;

  nextTick(() => {
    if (tooltipRef.value && event.target) {
      // Destroy any existing instance
      if (popperInstance) popperInstance.destroy();

      popperInstance = createPopper(event.target, tooltipRef.value, {
        placement: "top",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 10],
            },
          },
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
            },
          },
        ],
      });
    }
  });
};

const hideTooltip = () => {
  showTooltipState.value = false;
  if (popperInstance) {
    popperInstance.destroy();
    popperInstance = null;
  }
};
</script>
<template>
  <div id="navBar" :class="{ 'menu-open': menuOpen }">
    <div id="btns" :class="{ active: menuOpen }">
      <NuxtLink to="/centro" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " @mouseenter="showTooltip($event, 'Pàgina Principal')" @mouseleave="hideTooltip"
          :class="{ 'btn-activo': isActive('/centro') }">
          <img src="/img/navBarProfes/home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <br />

      <NuxtLink to="/centro/inscripcionsTallers" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " @mouseenter="showTooltip($event, 'Inscripcions Tallers')" @mouseleave="hideTooltip" :class="{
          'btn-activo': isActive('/centro/inscripcionsTalleres'),
        }">
          <img src="/img/navBarProfes/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <br />
      <NuxtLink to="/centro/estatInscripcionsTallers" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " @mouseenter="showTooltip($event, 'Estat Inscripcions')" @mouseleave="hideTooltip" :class="{
          'btn-activo': isActive('/centro/estatInscripcionsTalleres'),
        }">
          <img src="/img/navBarProfes/checkbox.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <br />
      <NuxtLink to="/centro/tallersFinalitzats" custom v-slot="{ navigate }">
        <button @click="
          navigate();
        closeMenu();
        " @mouseenter="showTooltip($event, 'Tallers Finalitzats')" @mouseleave="hideTooltip" :class="{
          'btn-activo': isActive('/centro/tallersFinalitzats'),
        }">
          <img src="/img/navBarProfes/document-alt.png" alt="" />
        </button>
      </NuxtLink>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showTooltipState" ref="tooltipRef" class="custom-popper-tooltip">
      {{ tooltipText }}
    </div>
  </Teleport>
</template>
<style>
/* Desktop: Vertical sidebar (default) */
/* Desktop: Vertical sidebar (default) */
#navBar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  height: calc(100vh - 150px);
  min-height: calc(100vh - 150px);
  max-height: calc(100vh - 150px);
  flex-shrink: 0;
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

.custom-popper-tooltip {
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-family: "Coolvetica", Arial, sans-serif;
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
    height: calc(100vh - 170px);
    min-height: calc(100vh - 170px);
    max-height: calc(100vh - 170px);
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
    height: calc(100vh - 190px);
    min-height: calc(100vh - 190px);
    max-height: calc(100vh - 190px);
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


  .custom-popper-tooltip {
    font-size: 13px;
    padding: 7px 12px;
  }
}
</style>
