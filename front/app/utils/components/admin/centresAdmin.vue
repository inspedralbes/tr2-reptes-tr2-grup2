<script setup>
import { ref, onMounted } from "vue";
import { getAllInstitucions } from "~/services/communicationManagerDatabase";

const institucions = ref([]);
const filaActiva = ref(null);

const cargarInstitucions = async () => {
  try {
    institucions.value = await getAllInstitucions();
    console.log("Institucions obtingudes:", institucions.value);
  } catch (error) {
    console.error("Error al obtenir les institucions:", error);
  }
};

onMounted(async () => {
  await cargarInstitucions();
});

// Toggle del desplegable al clicar el botón
const toggleDetalls = (id) => {
  filaActiva.value = filaActiva.value === id ? null : id;
};
</script>
<template>
  <div id="container">
    <div class="header-lista">
      <button id="btn-filtres">Filtres</button>
    </div>
    <div class="lista-container">
      <!-- CONTENEDOR: fila + desplegable debajo -->
      <div
        v-for="institucio in institucions"
        :key="institucio.id"
        class="curso-item"
        :class="{ abierto: filaActiva === institucio.id }"
        :style="{ zIndex: filaActiva === institucio.id ? 100 : 1 }"
      >
        <!-- FILA (barra superior) -->
        <div class="fila-curso">
          <div class="col-titulo">
            <span class="texto-titulo">{{ institucio.nom }}</span>
          </div>

          <div class="col-info">
            <span class="info-item">
              <img src="/img/centro/clock.png" class="icon" alt="icon" />
              {{ institucio.direccio }}
            </span>
          </div>

          <button class="btn-detalls" @click="toggleDetalls(institucio.id)">
            <span class="btn-detalls-text">
              {{ filaActiva === institucio.id ? "− Detalls" : "+ Detalls" }}
            </span>
          </button>
        </div>

        <!-- DESPLEGABLE HACIA ABAJO -->
        <transition name="slide">
          <div v-if="filaActiva === institucio.id" class="desplegable">
            <p>Codi centre: {{ institucio.codi_centre }}</p>
            <p>Direccio: {{ institucio.direccio }}</p>
            <p>Codi Postal:{{ institucio.codi_postal }}</p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<style scoped>
#container {
  font-family: Arial, Helvetica, sans-serif;
  width: 100%;
  max-height: 550px;
  display: flex;
  flex-direction: column;
}

.header-lista {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 50px;
  margin-bottom: 10px;
  margin-right: 40px;
}
.header-lista p {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

#btn-filtres {
  background-color: #7986cb;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 22px;
  border: 2px solid #3949ab70;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

#btn-filtres:hover {
  background-color: #aab4e9;
  transform: translateY(-1px);
  border: 2px solid #5064cd70;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
}

.lista-container {
  max-width: 100%;
  width: 1000px;
  height: 300px;
  overflow-y: auto;
  overflow-x: visible;
  padding: 10px 20px;
}

/* contenedor por item (fila + desplegable) */
.curso-item {
  position: relative;
  margin-bottom: 10px;
}

.curso-item.abierto {
  background: #d7dbff;
  border-radius: 25px;
  padding-bottom: 12px;
  margin-top: 0px;
  overflow: visible;
}

p {
  padding: 0 25px 15px 25px;
  margin: 0;
}

.fila-curso {
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  height: 45px;
  position: relative;
}

.col-titulo {
  background-color: #7986cb;
  color: #1a1a1a;
  z-index: 3;
  flex: 2;
  width: 300px;
  min-height: 35px;
  display: flex;
  align-items: center;
  padding-left: 25px;
  border-radius: 25px;
  font-weight: bold;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -50px;
  z-index: 2;
  flex: 2;
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 15px;
  border-radius: 25px;
}

.btn-detalls {
  background-color: #c5cae9;
  margin-left: -30px;
  z-index: 1;
  width: 120px;
  min-height: 35px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
}
.btn-detalls-text {
  margin-left: 30px;
}

/* Desplegable */
.desplegable {
  background-color: #d5dafb;
  margin-left: 0;
  position: relative;
  width: 90%;
  padding: 0px 0 0 0;
}

/* Animación del desplegable */
.slide-enter-active,
.slide-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.25s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
