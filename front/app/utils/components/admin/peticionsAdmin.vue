<!--
  Paula:

  Hooolii, si cambias los estilos o la estructura HTML, no toques estas variables que el backend las necesita.
  Te dejo por aquí las que son críticas:
  
  VARIABLES (no renombrar ni cambiar tipos):
  - viendoInscripciones: boolean - controla si estamos viendo la lista de tallers o las inscripciones
  - tallerIdActual: número del ID del taller (IMPORTANTE: se usa en el fetch /tallers/:id/inscripcions-ordenadas)
  - tallerNomActual: nombre del taller (para mostrar en el header)
  - inscripciones: array de objetos con {id, institucion, alumnos, puntuacion, aceptadas[]}
  - placesMax: plazas totales del taller (viene del backend)
  - placesDisp: plazas disponibles (viene del backend)
  - inscripcionesSeleccionadas: objeto {inscripcionId: alumnosCount} para saber qué está checked
  - inscripcionesExpandidas: objeto {inscripcionId: boolean} para las filas expandidas
  
  FUNCIONES (mini explicacion por si no se entienden):
  - selectInscripcion(id, alumnos): actualiza inscripcionesSeleccionadas on/off
  - alumnosSeleccionados(): suma el total de alumnos seleccionados (se usa para validar plazas)
  - placesRestantes(): calcula placesMax - alumnosSeleccionados()
  - puedeSeleccionar(alumnos): chequea si hay suficientes plazas (para deshabilitar checkboxes)
  - guardarSeleccion(): crea {tallerId, inscripcionesAprobadas[], alumnosAprobados} y lo manda
  - cargarInscripciones(tallerId): hace fetch a /tallers/:id/inscripcions-ordenadas
  
  LO QUE EL BACKEND TE DEVUELVE:
  GET /tallers/:id/inscripcions-ordenadas retorna algo así:
  {
    taller: { placesMax: number, placesDisp: number },
    inscripciones: [
      {
        id: number,
        institucion: string,
        alumnos: number,
        puntuacion: number,
        aceptadas: [
          { criterio: string, puntos: number, aplicat: boolean }
        ]
      }
    ]
  } omgg
  
  COSAS QUE ESCPLOTA TODO SI LAS CAMBIAS:
  - Los checkboxes tienen que deshabilitarse cuando no hay plazas
  - inscripcionesSeleccionadas debe guardar {inscripcionId: alumnosCount} 
  - placesMax no cambia una vez que se carga (viene del backend)
  - alumnosSeleccionados() tiene que sumar bien para que la validación funcione
  - guardarSeleccion() tiene que mantener el formato JSON con tallerId, inscripcionesAprobadas, alumnosAprobados

  GRACIAS <3
  :33
-->

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
// SelectorAlumnos removed from this component to hide numeric dropdown
import { getImageUrl } from "@/utils/imageUtils";
import {
  getAllTallers,
  getTallersByPeriode,
  confirmarInscripciones,
  pointsTallers,
  getSystemSettings,
  procesarInscripcions,
} from "@/services/communicationManagerDatabase";
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
const periodeActual = ref(null);

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
    const data = await pointsTallers(tallerId);
    inscripciones.value = data.inscripciones;
    placesMax.value = data.taller.placesMax;
    placesDisp.value = data.taller.placesDisp;

    // Cargar checkboxes de inscripciones ya aprobadas
    data.inscripciones.forEach((insc) => {
      if (insc.estat === "APROBADA") {
        inscripcionesSeleccionadas.value[insc.id] = insc.alumnos;
      }
    });
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
  Swal.fire({
    icon: "success",
    title: "Éxit",
    text: `Guardado: ${idsSeleccionados.length} inscripcions amb ${alumnosSeleccionados()} alumnes`,
    draggable: true,
    confirmButtonText: "Tancar",
  });
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
      imagen: getImageUrl(t),
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
    // Obtener el periodo actual
    const settings = await getSystemSettings();
    periodeActual.value = settings.selectedPeriodeId;
    console.log("Periodo actual:", periodeActual.value);

    // Obtener solo los talleres del periodo actual
    const rawData = await getTallersByPeriode(periodeActual.value);
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

async function guardarInscripciones() {
  try {
    const inscripcionesAprobadas = Object.keys(
      inscripcionesSeleccionadas.value
    ).map(Number);

    await confirmarInscripciones(tallerIdActual.value, inscripcionesAprobadas);
    Swal.fire({
      icon: "success",
      title: "Éxit",
      text: `${inscripcionesAprobadas.length} inscripciones aprovades`,
      draggable: true,
      confirmButtonText: "Tancar",
    });

    await cargarInscripciones(tallerIdActual.value);
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al guardar les inscripcions",
      confirmButtonText: "Tancar",
    });
  }
}

async function enviarsInscripciones() {
  const result = await Swal.fire({
    icon: "warning",
    title: "Estàs segur que vols enviar les inscripcions? (No hi ha marxa enrere)",
    showCancelButton: true,
    confirmButtonText: "Enviar"
  });

  if (result.isConfirmed) {
    try {
      await procesarInscripcions(periodeActual.value);
      await Swal.fire({
        icon: "success",
        title: "Èxit",
        text: "Les inscripcions s'han enviat correctament",
        confirmButtonText: "Tancar",
      });
    } catch (error) {
      console.error("Error al enviar les inscripcions:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al enviar les inscripcions. Si us plau, intenta-ho més tard.",
        confirmButtonText: "Tancar",
      });
    }
  }
}

</script>

<template>
  <div id="container">

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
        <p>
          Plazas disponibles:
          <strong>{{ alumnosSeleccionados() }} / {{ placesMax }}</strong>
        </p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (alumnosSeleccionados() / placesMax) * 100 + '%' }"></div>
        </div>
      </div>

      <table class="tabla-inscripciones">
        <thead>
          <tr>
            <th style="width: 40px">✓</th>
            <th>Institució</th>
            <th style="width: 80px">Alumnes</th>
            <th style="width: 100px">Puntuació</th>
            <th style="width: 60px"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="insc in inscripciones" :key="insc.id">
            <tr :class="{
              'disabled-row':
                !puedeSeleccionar(insc.alumnos) &&
                !inscripcionesSeleccionadas[insc.id],
            }">
              <td>
                <input type="checkbox" :checked="!!inscripcionesSeleccionadas[insc.id]"
                  @change="selectInscripcion(insc.id, insc.alumnos)" :disabled="!puedeSeleccionar(insc.alumnos) &&
                    !inscripcionesSeleccionadas[insc.id]
                    " />
              </td>
              <td>{{ insc.institucion }}</td>
              <td>{{ insc.alumnos }}</td>
              <td>
                <div class="puntuacion-cell">
                  <span class="score">{{ insc.puntuacion }}</span>
                  <button class="btn-expandir" @click="toggleInscripcionExpandida(insc.id)">
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
                  <div class="desglose-item" v-for="item in insc.aceptadas" :key="item.criterio">
                    <span class="criterio">{{ item.criterio }}</span>
                    <span :class="[
                      'puntos',
                      {
                        positivo: item.puntos > 0,
                        negativo: item.puntos < 0,
                        'no-aplicat': !item.aplicat,
                      },
                    ]">
                      {{
                        item.aplicat
                          ? (item.puntos > 0 ? "+" : "") + item.puntos
                          : "No aplicat"
                      }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div class="acciones">
        <button class="btn-guardar" @click="guardarInscripciones">
          Guardar selecció
        </button>
      </div>
    </div>

    <div v-if="!viendoInscripciones" class="lista-container">
      <div v-if="tallersGrouped.length === 0" class="loading-state">
        {{ cargando ? "Carregant tallers..." : "No hi ha tallers disponibles" }}
      </div>

      <div v-for="seccion in tallersGrouped" :key="seccion.mes" class="seccion-mes">
        <h2 class="mes-titulo">{{ seccion.mes }}</h2>

        <div v-for="curso in seccion.cursos" :key="curso.id" class="bloque-curso">
          <div class="fila-curso" :style="{ zIndex: filaActiva === curso.id ? 100 : 1 }">
            <div class="col-titulo">
              <img :src="curso.imagen" class="img-curso" alt="imagen curso" />
            </div>

            <div class="col-info">
              <div class="text-info">
                <span class="texto-titulo">{{ curso.titulo }}</span><br />
                <span class="info-item">
                  <img src="/img/centro/calendar.png" class="icon" alt="icon" />
                  {{ seccion.diaNum }}/{{ getMesNum(seccion.mes) }}
                  <img src="/img/centro/clock.png" class="icon" alt="icon" />
                  {{ curso.hora }}
                </span>
              </div>
            </div>

            <button class="btn-detalls" @click="toggleDetalles(curso.id)">
              <span class="btn-detalls-text" :class="{ rotar: cursoExpandido === curso.id }">+</span>
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
    <button class="btn-veure-inscripcions enviarsInscripcions" @click="enviarsInscripciones">
      <p>Enviar Les Inscripcions</p>
    </button>
  </div>
</template>

<style scoped>
/* --- CONTENEDOR PRINCIPAL --- */
/* #container {
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
} */

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
  background-color: #C5CAE9;
  margin-left: -100px;
  z-index: 1;
  width: 150px;
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
  width: 160px;
}

.btn-veure-inscripcions {
  background-color: #808bd1;
  color: 1D1D1D;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-style: solid;
  border-width: 4px;
  border-color: #5762aa;
  border-radius: 60px;
  cursor: pointer;
  margin-left: 40px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.btn-veure-inscripcions:hover {
  background-color: #959fdd;
  border-color: #959fdd;
  transform: translateY(-2px);
}


.btn-veure-inscripcions.enviarsInscripcions {
  margin-top: 5%;
  background-color: #808bd1;
  color: 1D1D1D;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-style: solid;
  border-width: 4px;
  border-color: #5762aa;
  border-radius: 60px;
  cursor: pointer;
  margin-left: 40px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
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
  color: #2c2c2c;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 20px;
  padding-left: 10px;
}

.header-inscripciones {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 5px 20px;
  border-radius: 20px;
}

.btn-volver {
  background-color: #9fa8da00;
  border-color: transparent;
  color: #1f1f1f;
  font-weight: 700;
  font-size: 18px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-volver:hover {
  background-color: transparent;
  border-color: transparent;
  transform: translateY(-2px);
}

/* --- DESPLEGABLE DE INFORMACIÓN --- */
.info-desplegable {
  margin-left: 153px;
  background-color: #D5DAFB;
  width: 35.5%;
  margin-top: -60px;
  padding: 70px 20px 15px 40px;
  border-radius: 0 0 30px 30px;
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

/* ========================================
   SELECCIÓN DE INSCRIPCIONES
   ======================================== */

/* --- CONTENEDOR Y HEADER --- */
.inscripciones-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-plazas {
  padding: 20px 25px;
  border-bottom: 2px solid #3948ab2c;
}

.info-plazas p {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: #2c2c2c;
  font-weight: 700;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e8ebf9;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid #b0b7e3;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5064cd 0%, #7986cb 100%);
  transition: width 0.3s ease;
  border-radius: 20px;
}

/* --- TABLA DE INSCRIPCIONES --- */
.tabla-inscripciones {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.tabla-inscripciones thead {
  background-color: transparent;
}

.tabla-inscripciones th {
  padding: 12px 15px;
  gap: 30px;
  text-align: left;
  font-weight: 600;
  color: #3949ab;
  background-color: transparent;
}

.tabla-inscripciones tbody tr {
  transition: all 0.2s ease;
}

.tabla-inscripciones tbody tr:hover td {
  background-color: #e8ebf9;
}

.tabla-inscripciones tbody tr.disabled-row {
  opacity: 0.5;
  pointer-events: none;
}

.tabla-inscripciones td {
  padding: 15px 18px;
  background-color: #D5DAFB;
  border: none;
}

.tabla-inscripciones td:first-child {
  border-radius: 30px 0 0 30px;
}

.tabla-inscripciones td:last-child {
  border-radius: 0 30px 30px 0;
}

.tabla-inscripciones input[type="checkbox"] {
  cursor: pointer;
  width: 20px;
  height: 20px;
  accent-color: #5064cd;
}

/* --- PUNTUACIÓN Y EXPANSIÓN --- */
.puntuacion-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score {
  font-weight: 700;
  color: #2c2c2c;
  font-size: 1rem;
}

.btn-expandir {
  background-color: #9fa8da;
  border: 3px solid #717ed3;
  color: #1f1f1f;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-expandir:hover {
  background-color: #7986cb;
  border-color: #5064cd;
  transform: scale(1.1);
}

/* --- DESGLOSE DE CRITERIOS --- */
.fila-desglose {
  background-color: transparent;
}

.fila-desglose td {
  padding: 0 18px 15px 18px !important;
  background-color: #c5cae9 !important;
  border-radius: 0 0 30px 30px !important;
}

.desglose {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  padding: 15px;
  background-color: #D5DAFB;
  border-radius: 20px;
}

.desglose-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: white;
  border-radius: 15px;
  border-left: 4px solid #7986cb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.criterio {
  font-size: 0.85rem;
  color: #2c2c2c;
  font-weight: 600;
}

.puntos {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
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

/* --- ACCIONES (GUARDAR) --- */
.acciones {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  border-top: 2px solid #3948ab2c;
  margin-top: 10px;
}

.btn-guardar {
  background-color: #4654af;
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 40px;
  border-style: solid;
  border-width: 4px;
  border-color: #303869;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.btn-guardar:hover {
  background-color: #5064cd;
  border-color: #424d91;
  transform: translateY(-2px);
}
</style>
