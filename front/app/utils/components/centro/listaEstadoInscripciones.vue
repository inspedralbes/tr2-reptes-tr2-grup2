<script setup>
import { ref, onMounted, computed } from "vue";
import { getAllTallers, getAllInscripcions, getInstitucionById, getUsuariById } from "@/services/communicationManagerDatabase";

// Estados reactivos
const tallersGrouped = ref([]);
const cursoExpandido = ref(null);
const filaActiva = ref(null);
const cargando = ref(true);
const filterOpen = ref(false);
const openMonthFilter = ref(false);
const openHorariFilter = ref(false);
const selectedMonth = ref(null);
const selectedMonths = ref([]);
const selectedHoraris = ref([]);
const searchTaller = ref("");
const inscripcionsMap = ref({}); 
const usuarioInstitucion = ref(null); 
const horaris = ref([]);

const selecciones = ref({});

// Funciones de UI
const toggleDetalles = (id) => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;
};

//Para los filtros
const meses = [
  "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
];

function toggleMonthSelection(mes){
  const index = selectedMonths.value.indexOf(mes);
  if (index === -1) {
    selectedMonths.value.push(mes);
  } else {
    selectedMonths.value.splice(index, 1);
  }
}
function removeMonth(mes) {
  selectedMonths.value = selectedMonths.value.filter(m => m !== mes);
}

function toggleHorariSelection(horari){
  const index = selectedHoraris.value.indexOf(horari);
  if (index === -1) {
    selectedHoraris.value.push(horari);
  } else {
    selectedHoraris.value.splice(index, 1);
  }
}

function removeHorari(horari) {
  selectedHoraris.value = selectedHoraris.value.filter(h => h !== horari);
}

// Obtener lista de horarios únicos
function extractHoraris(data) {
  const listaHoras = [];

  for (let i = 0; i < data.length; i++) {
    const t = data[i];
    let horari = {};

    // Intento de parsear el horario
    try {
      if (typeof t.horari === "string" && t.horari.trim() !== "") {
        horari = JSON.parse(t.horari);
      } else if (t.horari) {
        horari = t.horari;
      }
    } catch (e) {
      horari = {};
    }

    // Acceso seguro a la hora de inicio
    let hora = "00:00";
    if (horari.TORNS && horari.TORNS[0] && horari.TORNS[0].HORAINICI) {
      hora = horari.TORNS[0].HORAINICI;
    }

    // Evitar duplicados manualmente
    let existe = false;
    for (let j = 0; j < listaHoras.length; j++) {
      if (listaHoras[j] === hora) {
        existe = true;
        break;
      }
    }

    if (!existe) {
      listaHoras.push(hora);
    }
  }

  // Ordenar alfabéticamente
  return listaHoras.sort();
}

// Lógica de procesamiento de datos
const processTallers = (data, inscritos) => {
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

  // Filtrar solo los talleres a los que hay inscripción
  data.forEach((t) => {
    // Buscar si hay inscripción para este taller
    const inscripcion = inscritos.find(i => {
      const alumnesArray = JSON.parse(i.alumnes || "[]");
      return alumnesArray.some(a => a.TALLER === t.id);
    });
    
    // Si no hay inscripción, no incluir el taller
    if (!inscripcion) return;

    let horari = {};
    try {
      horari =
        typeof t.horari === "string" && t.horari.trim() !== ""
          ? JSON.parse(t.horari)
          : t.horari || {};
    } catch (e) {
      horari = {};
    }

    const dataStr = horari.DATAINI || "";
    let year = null, month = null, day = null;

    if (dataStr.includes("/")) {
      const parts = dataStr.split("/");
      day = parts[0] ? parseInt(parts[0], 10) : null;
      month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
      year = parts[2] ? parseInt(parts[2], 10) : null;
    } else if (dataStr.includes("-")) {
      const parts = dataStr.split("-");
      year = parts[0] ? parseInt(parts[0], 10) : null;
      month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
      day = parts[2] ? parseInt(parts[2], 10) : null;
    }

    const dateObj = year && month !== null && month >= 0 && day ? new Date(year, month, day) : null;
    const mesNombre = dateObj ? mesesNombres[dateObj.getMonth()] : "Desconegut";
    const diaNum = dateObj ? dateObj.getDate() : day || null;
    const mesNum = dateObj ? dateObj.getMonth() + 1 : (month !== null ? month + 1 : null);

    // Si el mes no existe en nuestro objeto agrupador, lo creamos
    if (!grouped[mesNombre]) {
      grouped[mesNombre] = {
        mes: mesNombre,
        diaNum: diaNum,
        cursos: [],
      };
    }

    // Añadimos el taller al grupo de su mes con el estado de inscripción
    grouped[mesNombre].cursos.push({
      id: t.id,
      titulo: t.nom,
      hora: horari.TORNS?.[0]?.HORAINICI || "00:00",
      imagen: "/img/centro/image.png",
      descripcio: t.descripcio,
      direccio: t.direccio,
      mesNum: mesNum,
      diaNum: diaNum,
      rawHorari: horari,
      estadoInscripcion: inscripcion.estat !== null ? (inscripcion.estat ? "Aprovada" : "Pendent") : "Pendent",
      autoritzat: inscripcion.autoritzat || false,
    });
  });

  // Convertimos el objeto en un array para el v-for
  return Object.values(grouped);
};

// Carga inicial
onMounted(async () => {
  try {
    const rawData = await getAllTallers();
    horaris.value = extractHoraris(rawData);
    
    const inscripciones = await getAllInscripcions();
    const usuarioInstitucionId = localStorage.getItem("user_institution_id");
    const inscripcionesFiltridas = [];
    for (const i of inscripciones) {
      if (usuarioInstitucionId) {
        if (i.institucio === parseInt(usuarioInstitucionId)) {
          inscripcionesFiltridas.push(i);
        }
      } else {
        // Si no hay ID de institución, las añadimos todas
        inscripcionesFiltridas.push(i);
      }
    }
    inscripcionsMap.value = {};
    for (const i of inscripcionesFiltridas) {
      const alumnesArray = JSON.parse(i.alumnes || "[]");
      alumnesArray.forEach(alumne => {
        if (!inscripcionsMap.value[alumne.TALLER]) {
          inscripcionsMap.value[alumne.TALLER] = [];
        }
        inscripcionsMap.value[alumne.TALLER].push(i);
      });
    }
    
    tallersGrouped.value = processTallers(rawData, inscripcionesFiltridas);
  } catch (error) {
    console.error("Error cargando talleres:", error);
  } finally {
    cargando.value = false;
  }
});

// Función para filtrar talleres según criterios
const filteredTallers = computed(() => {
  const resultadoFinal = [];

  for (const seccion of tallersGrouped.value) {
    // 1. Filtro de Mes
    let mesCoincide = true;
    if (selectedMonths.value.length > 0) {
      mesCoincide = false;
      for (const m of selectedMonths.value) {
        if (m === seccion.mes) {
          mesCoincide = true;
          break;
        }
      }
    }

    // Si el mes no coincide, saltamos a la siguiente sección
    if (!mesCoincide) continue;

    // 2. Filtrar cursos dentro de la sección
    const cursosFiltrados = [];
    for (const curso of seccion.cursos) {
      
      // Filtro de Horario
      let horarioValido = true;
      if (selectedHoraris.value.length > 0) {
        horarioValido = false;
        for (const h of selectedHoraris.value) {
          if (h === curso.hora) {
            horarioValido = true;
            break;
          }
        }
      }

      // Filtro de Búsqueda
      let busquedaValida = true;
      if (searchTaller.value.trim() !== "") {
        const searchLower = searchTaller.value.toLowerCase();
        const tituloLower = curso.titulo.toLowerCase();
        if (tituloLower.indexOf(searchLower) === -1) {
          busquedaValida = false;
        }
      }

      // Si pasa ambos filtros, lo añadimos
      if (horarioValido && busquedaValida) {
        cursosFiltrados.push(curso);
      }
    }

    // 3. Solo añadir la sección si tiene cursos que pasaron los filtros
    if (cursosFiltrados.length > 0) {
      resultadoFinal.push({
        mes: seccion.mes,
        cursos: cursosFiltrados
      });
    }
  }

  return resultadoFinal;
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
      <button @click="filterOpen = !filterOpen" id="btn-filtro">Filtres</button>
    </div>
  
  <div v-if="filterOpen" id="popup-filter">
  <button @click="filterOpen = false">x</button>

  <h3>MES</h3>
  <div>
    <div @click="openMonthFilter = !openMonthFilter" class="select-header">
      <span v-if="selectedMonths.length === 0">Escull el mes...</span>
      <span v-else>{{ selectedMonths.length }} meses seleccionats</span>
      <span>▲</span>
    </div>

    <div v-if="openMonthFilter" class="months-grid">
      <button 
        v-for="mes in meses" 
        :key="mes"
        class="month-chip"
        @click="toggleMonthSelection(mes)" 
        :class="{ 'is-active': selectedMonths.includes(mes) }"
      >
        {{ mes }}
      </button>
      <button class="btn-aplicar" @click="openMonthFilter = false">Aplicar</button>
    </div>

    <div class="selected-tags-container">
      <div 
        v-for="mes in selectedMonths" 
        :key="mes" 
        class="selected-tag"
      >
        {{ mes }}
        <span class="remove-icon" @click="removeMonth(mes)">×</span>
      </div>
    </div>
  </div>

  <h3>TALLER</h3>
  <div>
    <input 
      v-model="searchTaller"
      type="text" 
      placeholder="Cercar taller..." 
      class="search-input"
    />
  </div>

  <h3>HORARI</h3>
  <div>
    <div @click="openHorariFilter = !openHorariFilter" class="select-header">
      <span v-if="selectedHoraris.length === 0">Escull l'horari...</span>
      <span v-else>{{ selectedHoraris.length }} horaris seleccionats</span>
      <span>▲</span>
    </div>

    <div v-if="openHorariFilter" class="horaris-grid">
      <button 
        v-for="horari in horaris" 
        :key="horari"
        class="horari-chip"
        @click="toggleHorariSelection(horari)" 
        :class="{ 'is-active': selectedHoraris.includes(horari) }"
      >
        {{ horari }}
      </button>
      <button class="btn-aplicar" @click="openHorariFilter = false">Aplicar</button>
    </div>

    <div class="selected-tags-container">
      <div 
        v-for="horari in selectedHoraris" 
        :key="horari" 
        class="selected-tag"
      >
        {{ horari }}
        <span class="remove-icon" @click="removeHorari(horari)">×</span>
      </div>
    </div>
  </div>
      </div

    </div>
    <div class="lista-container">
      <div v-if="tallersGrouped.length === 0" class="loading-state">
        {{ cargando ? "Carregant tallers..." : "No hi ha tallers disponibles" }}
      </div>

      <div
        v-for="seccion in filteredTallers"
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
                  <img src="/img/centro/calendar.png" class="icon" />
                  {{ curso.diaNum }}/{{ getMesNum(seccion.mes) }}
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

            <div class="col-estado">
              <span class="estado-badge" :class="{ 'estado-aprovada': curso.estadoInscripcion === 'Aprovada', 'estado-pendent': curso.estadoInscripcion === 'Pendent', 'estado-denegado': curso.estadoInscripcion === 'Denegada' }">
                {{ curso.estadoInscripcion }}
              </span>
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
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 25px;
  width: 1050px;
  height: 380px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.308);
}

#popup-filter {
  position: absolute;
  top: 150px;
  right: 150px;
  width: 300px;
  max-height: 500px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  border-radius: 10px;
  overflow-y: auto;
}

#popup-filter > button {
  float: right;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  margin-bottom: 10px;
}

#popup-filter > button:hover {
  color: #333;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 15px;
}

.month-chip {
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

.month-chip:hover {
  background-color: #b0b5d9;
}

.horaris-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 15px;
}

.horari-chip {
  background-color: #c5cae9;
  border: none;
  border-radius: 20px;
  padding: 8px 5px;
  cursor: pointer;
  transition: 0.3s;
  width: 100%;
  text-align: center;
  font-size: 13px;
}

.horari-chip:hover {
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
  grid-column: span 2;
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
  transition: 0.3s;
}

#btn-filtro:hover {
  background-color: #6b75c2;
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

/* --- COLUMNA ESTADO --- */
.col-estado {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 100px;
  margin-right: 20px;
  width: auto;
  z-index: 4;
}

.estado-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.estado-aprovada {
  background-color: #AECAAF;
  border-color: #8DA88D;
  border-style: solid;
  border-width: 4px;
  color: #1D1D1D;
}

.estado-pendent {
  background-color: #FFBA94;
  border-color: #D39D80;
  border-style: solid;
  border-width: 4px;
  color: #1D1D1D;
}

.estado-denegado{
  background-color: #EB7A7A;
  border-color: #B26060;
  border-style: solid;
  border-width: 4px;
  color: #1D1D1D;
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
