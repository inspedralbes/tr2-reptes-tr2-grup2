<script setup>
import { ref, onMounted, computed } from "vue";
import { getAllInstitucions } from "~/services/communicationManagerDatabase";

const institucions = ref([]);

// Estados reactivos para filtros
const filterOpen = ref(false);
const openCodiPostalFilter = ref(false);
const selectedCodiPostals = ref([]);
const searchCentre = ref("");
const codisPostals = ref([]);

const cargarInstitucions = async () => {
  try {
    institucions.value = await getAllInstitucions();
    // Extraer códigos postales únicos
    codisPostals.value = extractCodiPostals(institucions.value);
  } catch (error) {
    console.error("Error al obtenir les institucions:", error);
  }
};

const extractCodiPostals = (data) => {
  const codisSet = new Set();
  data.forEach((institucio) => {
    if (institucio.codi_postal) {
      codisSet.add(institucio.codi_postal);
    }
  });
  return Array.from(codisSet).sort();
};

const toggleCodiPostalSelection = (codi) => {
  const index = selectedCodiPostals.value.indexOf(codi);
  if (index === -1) {
    selectedCodiPostals.value.push(codi);
  } else {
    selectedCodiPostals.value.splice(index, 1);
  }
};

const removeCodiPostal = (codi) => {
  selectedCodiPostals.value = selectedCodiPostals.value.filter((c) => c !== codi);
};

// Computed para filtrar instituciones
const institucionsFiltrades = computed(() => {
  let filtered = institucions.value;

  // Filtro por código postal
  if (selectedCodiPostals.value.length > 0) {
    filtered = filtered.filter((institucio) => {
      return selectedCodiPostals.value.includes(institucio.codi_postal);
    });
  }

  // Filtro por búsqueda de nombre
  if (searchCentre.value.trim() !== "") {
    const busqueda = searchCentre.value.toLowerCase();
    filtered = filtered.filter((institucio) => {
      return institucio.nom.toLowerCase().includes(busqueda);
    });
  }

  return filtered;
});

onMounted(async () => {
  await cargarInstitucions();
});

const filaActiva = ref(null);

// Toggle del desplegable al clicar el botón
const toggleDetalls = (id) => {
  filaActiva.value = filaActiva.value === id ? null : id;
};
</script>
<template>
  <div id="container">
    <div class="header-lista">
      <button id="btn-filtres" @click="filterOpen = !filterOpen">
        Filtres
      </button>
    </div>

    <!-- POPUP DE FILTRES -->
    <div v-if="filterOpen" id="popup-filter">
      <button @click="filterOpen = false">x</button>

      <!-- Filtro de CODI POSTAL -->
      <h3>CODI POSTAL</h3>
      <div>
        <div @click="openCodiPostalFilter = !openCodiPostalFilter" class="select-header">
          <span v-if="selectedCodiPostals.length === 0">Escull el codi postal...</span>
          <span v-else>{{ selectedCodiPostals.length }} codis seleccionats</span>
          <span class="arrow" :class="{ rotated: openCodiPostalFilter }">▲</span>
        </div>

        <div v-if="openCodiPostalFilter" class="codis-grid">
          <button v-for="codi in codisPostals" :key="codi" class="codi-chip" @click="toggleCodiPostalSelection(codi)"
            :class="{ 'is-active': selectedCodiPostals.includes(codi) }">
            {{ codi }}
          </button>
          <button class="btn-aplicar" @click="openCodiPostalFilter = false">
            Aplicar
          </button>
        </div>

        <div class="selected-tags-container">
          <div v-for="codi in selectedCodiPostals" :key="codi" class="selected-tag">
            {{ codi }}
            <span class="remove-icon" @click="removeCodiPostal(codi)">×</span>
          </div>
        </div>
      </div>

      <!-- Filtro de BÚSQUEDA -->
      <h3>CENTRE</h3>
      <div>
        <input v-model="searchCentre" type="text" class="search-input" placeholder="Cercar centre..." />
      </div>
    </div>

    <div class="lista-container">
      <!-- CONTENEDOR: fila + desplegable debajo -->
      <div v-for="institucio in institucionsFiltrades" :key="institucio.id" class="curso-item"
        :class="{ abierto: filaActiva === institucio.id }" :style="{ zIndex: filaActiva === institucio.id ? 100 : 1 }">
        <!-- FILA (barra superior) -->
        <div class="fila-curso">
          <div class="col-titulo">
            <span class="texto-titulo">{{ institucio.nom }}</span>
          </div>

          <div class="col-info">
            <span class="info-item">
              <img src="/img/centro/location.png" class="icon" alt="icon" />
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
            <p><b>Codi centre:</b> {{ institucio.codi_centre }}</p>
            <!-- <p><b>Direcció:</b> {{ institucio.direccio }}</p> -->
            <p><b>Codi Postal:</b> {{ institucio.codi_postal }}</p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<style scoped>
#container {
  font-family: Arial, Helvetica, sans-serif;
  width: 95%;
  height: calc(100vh - 350px);
  min-height: 400px;
  background-color: #FFFFFF;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.308);
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
  border: 3px solid #3949ab;
  border-radius: 30px;
  color: #1d1d1d;
  font-weight: bold;
  padding: 6px 18px;
  font-size: 15px;
  cursor: pointer;
  transition: 0.3s;
}

#btn-filtres:hover {
  background-color: #6b75c2;
}

.lista-container {
  max-width: 100%;
  margin-left: 7%;
  width: 100%;
  flex: 1;
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
  background: transparent;
  border-radius: 25px;
  padding-bottom: 0px;
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
  justify-content: flex-start;
  margin-bottom: 0px;
  height: 45px;
  position: relative;
  width: 100%;
}

.col-titulo {
  background-color: #7986cb;
  color: #1a1a1a;
  z-index: 3;
  width: clamp(250px, 40%, 400px);
  min-height: 35px;
  display: flex;
  align-items: center;
  padding-left: 25px;
  border-radius: 25px;
  font-weight: bold;
  margin-left: 0;
  flex-shrink: 0;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -50px;
  z-index: 2;
  width: clamp(280px, 35%, 450px);
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 15px;
  border-radius: 25px;
  flex-shrink: 0;
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.btn-detalls {
  background-color: #c5cae9;
  margin-left: -30px;
  z-index: 1;
  width: 170px;
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
  margin-top: -20px;
  position: relative;
  width: calc(100% - 40px);
  max-width: 990px;
  min-width: 600px;
  margin-left: 0;
  padding-top: 15px;
  border-radius: 0 0 25px 25px;
  box-sizing: border-box;
}

.desplegable p {
  padding: 0 20px 12px 20px;
  margin-top: 2%;
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

/* --- FILTROS --- */
#popup-filter {
  position: absolute;
  top: 70px;
  right: 60px;
  width: 320px;
  max-height: 480px;
  background-color: white;
  box-shadow: 0 8px 24px rgba(57, 73, 171, 0.2);
  padding: 20px;
  z-index: 1000;
  border-radius: 20px;
  overflow-y: auto;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#popup-filter>button {
  float: right;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  margin-bottom: 10px;
}

#popup-filter>button:hover {
  color: #333;
}

.codis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 15px;
}

.codi-chip {
  background-color: #c5cae9;
  border: none;
  border-radius: 20px;
  padding: 8px 5px;
  cursor: pointer;
  transition: 0.3s;
  width: 100%;
  text-align: center;
  font-size: 12px;
}

.codi-chip:hover {
  background-color: #b0b5d9;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 15px;
  font-size: 13px;
  outline: none;
  transition: border 0.3s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #3949ab;
  box-shadow: 0 0 5px rgba(57, 73, 171, 0.3);
}

.is-active {
  background-color: #3949ab !important;
  color: white;
}

.selected-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.selected-tag {
  background-color: #3949ab;
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-icon {
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.remove-icon:hover {
  color: #ff8a80;
}

.btn-aplicar {
  grid-column: span 3;
  margin-top: 10px;
  background-color: #3949ab;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

.btn-aplicar:hover {
  background-color: #4a52c4;
}

.select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #e8eaf6;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  font-size: 13px;
}

.select-header:hover {
  background-color: #d7dbf1;
}

#popup-filter h3 {
  margin-bottom: 10px;
  border-bottom: 1px solid #7987cb8a;
  padding-bottom: 10px;
  margin-top: 15px;
  font-size: 14px;
}

#popup-filter h3:first-of-type {
  margin-top: 0;
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}
</style>
