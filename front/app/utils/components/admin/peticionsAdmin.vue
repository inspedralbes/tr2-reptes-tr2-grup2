<script setup>
import { ref, onMounted } from "vue";
// SelectorAlumnos removed from this component to hide numeric dropdown
import { getAllTallers } from "@/services/communicationManagerDatabase";
import "@fortawesome/fontawesome-free/css/all.css";

// Estados reactivos
const tallersGrouped = ref([]);
const cursoExpandido = ref(null);
const filaActiva = ref(null);
const cargando = ref(true);
const viendoInscripciones = ref(false);
const tallerNomActual = ref("");
const tallerIdActual = ref(null);
const inscripciones = ref([]);
const placesDisp = ref(0);
const placesMax = ref(0);
const inscripcionesExpandidas = ref({});
const inscripcionesSeleccionadas = ref({});

// Funciones de UI
const toggleDetalles = (id) => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;
};

// actualizarPrioridad removed for this view (no numeric selector here)

const vereuInscripcions = (tallerId, tallerNom) => {
  viendoInscripciones.value = true;
  tallerNomActual.value = tallerNom;
  tallerIdActual.value = tallerId;
  cargarInscripciones(tallerId);
};

const volverALista = () => {
  viendoInscripciones.value = false;
  tallerNomActual.value = "";
  tallerIdActual.value = null;
  inscripciones.value = [];
  inscripcionesSeleccionadas.value = {};
  inscripcionesExpandidas.value = {};
};

const cargarInscripciones = async (tallerId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/tallers/${tallerId}/inscripcions-ordenadas`
    );
    const data = await response.json();
    inscripciones.value = data.inscripciones;
    placesMax.value = data.taller.placesMax;
    placesDisp.value = data.taller.placesDisp;
  } catch (error) {
    console.error("Error al cargar inscripciones:", error);
  }
};

const toggleInscripcionExpandida = (id) => {
  inscripcionesExpandidas.value[id] = !inscripcionesExpandidas.value[id];
};

const selectInscripcion = (id, alumnos) => {
  if (inscripcionesSeleccionadas.value[id]) {
    // Desmarcar
    delete inscripcionesSeleccionadas.value[id];
  } else {
    // Marcar
    inscripcionesSeleccionadas.value[id] = alumnos;
  }
};

const alumnosSeleccionados = () => {
  return Object.values(inscripcionesSeleccionadas.value).reduce(
    (sum, alumnos) => sum + alumnos,
    0
  );
};

const placesRestantes = () => {
  return placesMax.value - alumnosSeleccionados();
};

const puedeSeleccionar = (alumnos) => {
  return placesRestantes() >= alumnos;
};

const guardarSeleccion = () => {
  const idsSeleccionados = Object.keys(inscripcionesSeleccionadas.value).map(
    (id) => Number(id)
  );
  const resultado = {
    tallerId: tallerIdActual.value,
    inscripcionesAprobadas: idsSeleccionados,
    alumnosAprobados: alumnosSeleccionados(),
  };
  console.log("Inscripciones aprobadas:", resultado);
  alert(`Guardado: ${idsSeleccionados.length} inscripciones con ${alumnosSeleccionados()} alumnos`);
};

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

    // Parseamos la fecha DATAINI (formato "01/10/2024")
    const parts = (horari.DATAINI || "").split("/");
    const year = parts[2] ? parseInt(parts[2], 10) : null;
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
    const day = parts[0] ? parseInt(parts[0], 10) : null;
    const dateObj = year && month >= 0 ? new Date(year, month, day) : null;
    const mesNombre = dateObj ? mesesNombres[dateObj.getMonth()] : "";
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
    <div v-if="!viendoInscripciones" class="header-lista">
      <button class="btn-filter-style">Tallers</button>
      <button class="btn-filter-style">Centres</button>
    </div>

    <div v-if="viendoInscripciones" class="header-inscripciones">
      <button class="btn-volver" @click="volverALista">
        <i class="fas fa-arrow-left"></i>
      </button>
      <div class="titulo-inscripciones">
        {{ tallerNomActual }}
      </div>
    </div>

    <!-- Vista de inscripciones -->
    <div v-if="viendoInscripciones" class="inscripciones-container">
      <div class="info-plazas">
        <p>Plazas disponibles: <strong>{{ alumnosSeleccionados() }} / {{ placesMax.value }}</strong></p>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: (alumnosSeleccionados() / placesMax.value) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <table class="tabla-inscripciones">
        <thead>
          <tr>
            <th style="width: 40px;">✓</th>
            <th>Institució</th>
            <th style="width: 80px;">Alumnes</th>
            <th style="width: 100px;">Puntuació</th>
            <th style="width: 60px;"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="insc in inscripciones" :key="insc.id">
            <tr 
              :class="{ 'disabled-row': !puedeSeleccionar(insc.alumnos) && !inscripcionesSeleccionadas[insc.id] }"
            >
              <td>
                <input 
                  type="checkbox"
                  :checked="!!inscripcionesSeleccionadas[insc.id]"
                  @change="selectInscripcion(insc.id, insc.alumnos)"
                  :disabled="!puedeSeleccionar(insc.alumnos) && !inscripcionesSeleccionadas[insc.id]"
                />
              </td>
              <td>{{ insc.institucion }}</td>
              <td>{{ insc.alumnos }}</td>
              <td>
                <div class="puntuacion-cell">
                  <span class="score">{{ insc.puntuacion }}</span>
                  <button 
                    class="btn-expandir"
                    @click="toggleInscripcionExpandida(insc.id)"
                  >
                    +
                  </button>
                </div>
              </td>
              <td></td>
            </tr>
            <!-- Fila expandida de desglose -->
            <tr v-if="inscripcionesExpandidas[insc.id]" class="fila-desglose">
              <td colspan="5">
                <div class="desglose">
                  <div class="desglose-item" v-for="item in insc.breakdown" :key="item.criterio">
                    <span class="criterio">{{ item.criterio }}</span>
                    <span 
                      :class="['puntos', { 'positivo': item.puntos > 0, 'negativo': item.puntos < 0, 'no-aplicat': !item.aplicat }]"
                    >
                      {{ item.aplicat ? (item.puntos > 0 ? '+' : '') + item.puntos : 'No aplicat' }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div class="acciones">
        <button class="btn-guardar" @click="guardarSeleccion">
          Guardar selecció
        </button>
      </div>
    </div>

    <div v-if="!viendoInscripciones" class="lista-container">
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

            <button class="btn-veure-inscripcions" @click="vereuInscripcions(curso.id, curso.titulo)">
              Veure inscripcions
            </button>

            <div class="desplegable-placeholder"></div>
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

.loading-state {
  text-align: center;
  padding: 40px;
  color: #7986cb;
  font-weight: bold;
}

.header-lista {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 15px;
  padding-right: 0;
}

.header-lista p {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.btn-filter-style {
  background-color: #7986cb;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 22px;
  border: 2px solid #3949ab70;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-filter-style:hover {
  background-color: #aab4e9;
  transform: translateY(-1px);
  border: 2px solid #5064cd70;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
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

.btn-veure-inscripcions {
  background-color: #5064cd;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 40px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-veure-inscripcions:hover {
  background-color: #3949ab;
  transform: translateY(-2px);
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

  /* dropdown removed: placeholder keeps layout if needed */
  .desplegable-placeholder {
    width: 45px;
    margin-left: auto;
    margin-right: 30px;
  }

.titulo-inscripciones {
  color: #283593;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 30px;
  padding-left: 70px;
}

.header-inscripciones {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn-volver {
  background-color: #7986cb;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 18px;
  width: 45px;
  height: 45px;
  padding: 0;
  border: 2px solid #3949ab70;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.btn-volver:hover {
  background-color: #aab4e9;
  transform: translateY(-1px);
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

/* --- VISTA DE INSCRIPCIONES --- */
.inscripciones-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.info-plazas {
  margin-bottom: 20px;
  padding: 0 20px;
}

.info-plazas p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #3949ab;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #5064cd;
  transition: width 0.3s ease;
}

.tabla-inscripciones {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.tabla-inscripciones thead {
  background-color: #f5f6ff;
  border-bottom: 2px solid #7986cb;
}

.tabla-inscripciones th {
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #3949ab;
}

.tabla-inscripciones tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
}

.tabla-inscripciones tbody tr:hover {
  background-color: #f9f9ff;
}

.tabla-inscripciones tbody tr.disabled-row {
  opacity: 0.5;
  pointer-events: none;
}

.tabla-inscripciones td {
  padding: 12px 15px;
}

.tabla-inscripciones input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #5064cd;
}

.puntuacion-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score {
  font-weight: 600;
  color: #3949ab;
  font-size: 0.95rem;
}

.btn-expandir {
  background: none;
  border: none;
  color: #7986cb;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-expandir:hover {
  background-color: #e8eaf6;
  transform: scale(1.1);
}

.fila-desglose {
  background-color: #f5f6ff;
}

.fila-desglose td {
  padding: 15px !important;
}

.desglose {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.desglose-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  border-left: 3px solid #7986cb;
}

.criterio {
  font-size: 0.85rem;
  color: #3949ab;
  font-weight: 500;
}

.puntos {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
}

.puntos.positivo {
  color: #2e7d32;
  background-color: #e8f5e9;
}

.puntos.negativo {
  color: #c62828;
  background-color: #ffebee;
}

.puntos.no-aplicat {
  color: #666;
  background-color: #eeeeee;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-guardar {
  background-color: #5064cd;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-guardar:hover {
  background-color: #3949ab;
  transform: translateY(-2px);
}

</style>
