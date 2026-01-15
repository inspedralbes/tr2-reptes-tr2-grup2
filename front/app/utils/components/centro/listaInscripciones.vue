<script setup>
import { ref, onMounted } from "vue";
import SelectorAlumnos from "@/utils/components/centro/desplegableAlumnos.vue";
import { getAllTallers } from "@/services/communicationManagerDatabase";

// Estados reactivos
const tallersGrouped = ref([]);
const cursoExpandido = ref(null);
const filaActiva = ref(null);
const cargando = ref(true);
const isMenuOpen = ref(false);
const selectedMonth = ref(null);


// Funciones de UI
const toggleDetalles = (id) => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;
};

const actualizarPrioridad = (id, isOpen) => {
  filaActiva.value = isOpen ? id : null;
};

//Para los filtros
const meses = [
  "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
];

// Lógica de procesamiento de datos
const processTallers = (data) => {
  const mesesNombres = [
    "Gener",
    "Febrer",
    "Març",
    "Abril",
    "Maig",
    "Juny",
    "Juliol",
    "Agost",
    "Setembre",
    "Octubre",
    "Novembre",
    "Desembre",
  ];

  const grouped = {};

  data.forEach((t) => {
    let horari = {};
    try {
      horari =
        typeof t.horari === "string" && t.horari.trim() !== ""
          ? JSON.parse(t.horari)
          : t.horari || {};
    } catch (e) {
      horari = {};
    }

    const parts = (horari.DATAINI || "").split("/");
    const year = parts[2] ? parseInt(parts[2], 10) : null;
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
    const day = parts[0] ? parseInt(parts[0], 10) : null;
    const dateObj = year && month >= 0 ? new Date(year, month, day) : null;
    const mesNombre = dateObj ? mesesNombres[dateObj.getMonth()] : "Desconegut";
    const diaNum = dateObj ? dateObj.getDate() : day || null;

    // Si el mes no existe en nuestro objeto agrupador, lo creamos
    if (!grouped[mesNombre]) {
      grouped[mesNombre] = {
        mes: mesNombre,
        diaNum: diaNum,
        cursos: [],
      };
    }

    // Añadimos el taller al grupo de su mes
    grouped[mesNombre].cursos.push({
      id: t.id,
      titulo: t.nom,
      hora: horari.TORNS?.[0]?.HORAINICI || "00:00",
      imagen: "/img/centro/image.png",
      descripcio: t.descripcio,
      direccio: t.direccio,
      mesNum: parts[1] || null,
      rawHorari: horari,
    });
  });

  // Convertimos el objeto en un array para el v-for
  return Object.values(grouped);
};

// Carga inicial
onMounted(async () => {
  try {
    const rawData = await getAllTallers();
    tallersGrouped.value = processTallers(rawData);
  } catch (error) {
    console.error("Error cargando talleres:", error);
  } finally {
    cargando.value = false;
  }
});

// Helper para el número de mes en el calendario visual
const getMesNum = (mes) => {
  const meses = {
    Gener: "01",
    Febrer: "02",
    Març: "03",
    Abril: "04",
    Maig: "05",
    Juny: "06", 
    Juliol: "07",
    Agost: "08",
    Setembre: "09",
    Octubre: "10",
    Novembre: "11",
    Desembre: "12",
  };
  return meses[mes] || "00";
};
</script>

<template>
  <div id="container">
    <div class="header-lista">
      <button id="btn-filtro">Filtres</button>
      <p>Alumnes</p>

    </div>
    <div id="popup-filter">
      <button>x</button>

      <h3>MES</h3>
      <div>
        <div @click="isMenuOpen = !isMenuOpen" class="select-header">
          <span v-if="selectedMonth === null">Escull el mes...</span>
          <span v-else>{{ selectedMonth }}</span>
          <span>▲</span>
        </div>
        <div v-if="isMenuOpen">
          <div v-for="mes in meses" :key="mes">
            <button 
              @click="selectedMonth = mes" 
              :class="{ 'is-active': selectedMonth === mes }"
            >
              {{ mes }}
            </button>
          </div>
        </div>
      </div>

      <h3>TALLER</h3>
      <h3>HORARI</h3>
      </div

    </div>
    <div class="lista-container">
      <div v-if="tallersGrouped.length === 0" class="loading-state">
        {{ cargando ? "Carregant tallers..." : "No hi ha tallers disponibles" }}
      </div>

      <div
        v-for="seccion in tallersGrouped"
        :key="seccion.mes"
        class="seccion-mes"
      >
        <h2 class="mes-titulo">{{ seccion.mes }}</h2>

        <div
          v-for="curso in seccion.cursos"
          :key="curso.id"
          class="bloque-curso"
        >
          <div
            class="fila-curso"
            :style="{ zIndex: filaActiva === curso.id ? 100 : 1 }"
          >
            <div class="col-titulo">
              <img :src="curso.imagen" class="img-curso" alt="imagen curso" />
            </div>

            <div class="col-info">
              <div class="text-info">
                <span class="texto-titulo">{{ curso.titulo }}</span
                ><br />
                <span class="info-item">
                  <img src="/img/centro/calendar.png" class="icon" />
                  {{ seccion.diaNum }}/{{ getMesNum(seccion.mes) }}
                  <img src="/img/centro/clock.png" class="icon" />
                  {{ curso.hora }}
                </span>
              </div>
            </div>

            <button class="btn-detalls" @click="toggleDetalles(curso.id)">
              <span
                class="btn-detalls-text"
                :class="{ rotar: cursoExpandido === curso.id }"
                >+</span
              >
            </button>

            <div class="desplegable">
              <SelectorAlumnos
                @toggle="(state) => actualizarPrioridad(curso.id, state)"
              />
            </div>
          </div>

          <Transition name="fade-slide">
            <div v-if="cursoExpandido === curso.id" class="info-desplegable">
              <div class="contenido-detalle">
                <p><strong>Descripció:</strong> {{ curso.descripcio }}</p>
                <p><strong>Ubicació:</strong> {{ curso.direccio }}</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- CONTENEDOR PRINCIPAL --- */
#container {
  margin-top: -25px;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 25px;
  width: 1050px;
  height: 420px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.308);
}

#popup-filter{
  position: absolute;
  top: 150px;
  right: 150px;
  width: 300px;
  height: 400px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
}
.months-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

/* El botón (chip) */
.month-chip {
  background-color: #c5cae9;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  cursor: pointer;
  transition: 0.3s;
}

.is-active {
  background-color: #3949ab !important;
  color: white;
}
h3{
  grid-column: span 2;
  margin-bottom: 10px;
  border-bottom: 1px solid #7987cb8a;
  padding-bottom: 10px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #7986cb;
  font-weight: bold;
}

/* --- HEADER --- */
.header-lista {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 40px;
  margin-bottom: 15px;
  padding-right: 60px;
}

.header-lista p {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

#btn-filtro {
  background-color: #7986cb;
  border: 3px solid #3949ab;
  border-radius: 30px;
  color: #1d1d1d;
  font-weight: bold;
  padding: 6px 18px;
  font-size: 15px;
  cursor: pointer;
}

/* --- LISTA Y SCROLL --- */
.lista-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 20px;
}

.lista-container::-webkit-scrollbar {
  width: 6px;
}

.lista-container::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 10px;
}

.lista-container::-webkit-scrollbar-thumb {
  background: #878787;
  border-radius: 10px;
}

/* --- ESTRUCTURA DE FILAS --- */
.bloque-curso {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.fila-curso {
  display: flex;
  align-items: center;
  height: 110px;
  position: relative;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 5px;
  transition: 0.3ms;
}

/* --- CÁPSULAS (COLUMNAS) --- */
.col-titulo {
  background-color: #7986cb;
  margin-left: 150px;
  color: #1a1a1a;
  z-index: 3;
  width: 110px;
  height: 110px;
  display: flex;
  border-radius: 1000px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.col-titulo img.img-curso {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -110px;
  z-index: 2;
  width: 350px;
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-left: 30px;
  border-radius: 250px;
}

.text-info {
  font-weight: bold;
  margin-left: 30%;
  margin-top: 40px;
  font-size: 0.85rem;
}

.btn-detalls {
  background-color: #c5cae9;
  margin-left: -100px;
  z-index: 1;
  width: 140px;
  height: 110px;
  border: none;
  border-radius: 200px;
  cursor: pointer;
  text-align: right;
  padding-right: 25px;
  transition: all 0.3s ease;
}

.btn-detalls:hover {
  background-color: #d2d7f7;
  width: 150px;
}

.btn-detalls-text {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: bold;
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn-detalls-text.rotar {
  transform: rotate(45deg);
}

.desplegable {
  margin-left: auto;
  margin-right: 30px;
  width: 45px;
}

/* --- DESPLEGABLE DE INFORMACIÓN --- */
.info-desplegable {
  margin-left: 153px;
  background-color: #f5f6ff;
  width: 34%;
  margin-top: -60px;
  padding: 50px 20px 15px 40px;
  border-radius: 0 0 30px 30px;
  border: 1px solid #c5cae9;
  z-index: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.contenido-detalle {
  color: #3949ab;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* --- OTROS --- */
.mes-titulo {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 25px 0px 10px 70px;
}

.icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

/* TRANSICIÓN VUE */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
