<script setup>
import { ref, onMounted, computed } from "vue";
import SelectorAlumnos from "@/utils/components/centro/desplegableAlumnos.vue";
import { getAllTallers, getAllInscripcions, confirmarInscripciones, saveInscripcions } from "@/services/communicationManagerDatabase";

// Estados reactivos
const tallersGrouped = ref([]);
const cursoExpandido = ref(null);
const filaActiva = ref(null);
const cargando = ref(true);
const filterOpen = ref(false);
const isMenuOpen = ref(false);
const openMonthFilter = ref(false);
const openHorariFilter = ref(false);
const selectedMonth = ref(null);
const selectedMonths = ref([]);
const selectedHoraris = ref([]);
const searchTaller = ref("");
const horaris = ref([]);

const selecciones = ref({});
const mostrarModalInsc = ref(false);
const docentRef = ref("");
const comentari = ref("");

// Funciones de UI
const toggleDetalles = (id) => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;
};

const actualizarPrioridad = (id, isOpen) => {
  filaActiva.value = isOpen ? id : null;
};
//Paula: Funcion para guardarme los datos que me quiero llevar
//al backend para hacer los inserts de la bbdd cuando se haga una insc
const guardarSeleccion = (tallerId, numeroSeleccionado) => {
  selecciones.value[tallerId] = Number(numeroSeleccionado);
  console.log("Selecciones actuales:", selecciones.value);
};

// Devuelve true si hay al menos una selección guardada
const hasSelections = () => Object.keys(selecciones.value).length > 0;

// Paula: funcion para abrir el modal de inscripciones
const enviarTodasSeleccionadas = () => {
  if (Object.keys(selecciones.value).length === 0) {
    console.log("No hay selecciones para enviar");
    return;
  }
  mostrarModalInsc.value = true;
};

// Paula: funcion para enviar datos al backend desde el modal
const confirmarEnvio = async () => {
  try {
    await saveInscripcions(selecciones.value, docentRef.value, comentari.value);
    console.log("Guardadas todas las selecciones");

    // Limpiar y cerrar
    selecciones.value = {};
    cerrarModal();
  } catch (err) {
    console.log("Error al guardar selecciones:", err.message);
  }
};

//Para los filtros
const meses = [
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

function toggleMonthSelection(mes) {
  const index = selectedMonths.value.indexOf(mes);
  if (index === -1) {
    selectedMonths.value.push(mes);
  } else {
    selectedMonths.value.splice(index, 1);
  }
}
function removeMonth(mes) {
  selectedMonths.value = selectedMonths.value.filter((m) => m !== mes);
}

function toggleHorariSelection(horari) {
  const index = selectedHoraris.value.indexOf(horari);
  if (index === -1) {
    selectedHoraris.value.push(horari);
  } else {
    selectedHoraris.value.splice(index, 1);
  }
}

function removeHorari(horari) {
  selectedHoraris.value = selectedHoraris.value.filter((h) => h !== horari);
}

function toggleFilter() {
  isMenuOpen.value = !isMenuOpen.value;
}

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
  return listaHoras.sort();
}
// Paula: funcion para cerrar el modal sin enviar
const cerrarModal = () => {
  mostrarModalInsc.value = false;
  docentRef.value = "";
  comentari.value = "";
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

    const dataStr = horari.DATAINI || "";
    let year = null,
      month = null,
      day = null;

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

    const dateObj =
      year && month !== null && month >= 0 && day
        ? new Date(year, month, day)
        : null;
    const mesNombre = dateObj ? mesesNombres[dateObj.getMonth()] : "Desconegut";
    const diaNum = dateObj ? dateObj.getDate() : day || null;
    const mesNum = dateObj
      ? dateObj.getMonth() + 1
      : month !== null
        ? month + 1
        : null;

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
      mesNum: mesNum,
      diaNum: diaNum,
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
    console.log("Datos crudos de talleres:", rawData);

    // Extraer horarios únicos
    horaris.value = extractHoraris(rawData);
    console.log("Horarios disponibles:", horaris.value);

    tallersGrouped.value = processTallers(rawData);
  } catch (error) {
    console.error("Error cargando talleres:", error);
  } finally {
    cargando.value = false;
  }
});

// Función para filtrar talleres según criterios
const filteredTallers = computed(() => {
  const resultadoFinal = [];

  for (let i = 0; i < tallersGrouped.value.length; i++) {
    const seccion = tallersGrouped.value[i];

    // 1. Filtro por mes (manual)
    if (selectedMonths.value.length > 0) {
      let mesEncontrado = false;
      for (let m = 0; m < selectedMonths.value.length; m++) {
        if (selectedMonths.value[m] === seccion.mes) {
          mesEncontrado = true;
          break;
        }
      }
      // Si el mes no está en los seleccionados, pasamos a la siguiente sección
      if (!mesEncontrado) {
        continue;
      }
    }

    // 2. Filtrar los cursos de esta sección
    const cursosValidos = [];
    for (let j = 0; j < seccion.cursos.length; j++) {
      const curso = seccion.cursos[j];

      // Filtro de horario
      let horarioPasa = true;
      if (selectedHoraris.value.length > 0) {
        horarioPasa = false;
        for (let h = 0; h < selectedHoraris.value.length; h++) {
          if (selectedHoraris.value[h] === curso.hora) {
            horarioPasa = true;
            break;
          }
        }
      }

      // Filtro de búsqueda por título
      let busquedaPasa = true;
      if (searchTaller.value.trim() !== "") {
        const busqueda = searchTaller.value.toLowerCase();
        const titulo = curso.titulo.toLowerCase();
        if (titulo.indexOf(busqueda) === -1) {
          busquedaPasa = false;
        }
      }

      // Si cumple ambos filtros, lo guardamos
      if (horarioPasa && busquedaPasa) {
        cursosValidos.push(curso);
      }
    }

    // 3. Solo añadir la sección al resultado si tiene cursos válidos
    if (cursosValidos.length > 0) {
      const nuevaSeccion = {
        mes: seccion.mes,
        cursos: cursosValidos,
      };
      resultadoFinal.push(nuevaSeccion);
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
      <button id="btn-filtro" @click="filterOpen = !filterOpen">Filtres</button>
      <button
        v-if="hasSelections()"
        class="btn-guardar"
        @click="enviarTodasSeleccionadas"
      >
        Guardar selecciones
      </button>
      <p>Alumnes</p>
    </div>
    <div v-if="filterOpen" id="popup-filter">
      <button @click="filterOpen = false">x</button>

      <!-- Filtro de MES -->
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
          <button class="btn-aplicar" @click="openMonthFilter = false">
            Aplicar
          </button>
        </div>

        <div class="selected-tags-container">
          <div v-for="mes in selectedMonths" :key="mes" class="selected-tag">
            {{ mes }}
            <span class="remove-icon" @click="removeMonth(mes)">×</span>
          </div>
        </div>
      </div>

      <!-- Filtro de BÚSQUEDA -->
      <h3>TALLER</h3>
      <div>
        <input
          v-model="searchTaller"
          type="text"
          class="search-input"
          placeholder="Cercar taller..."
        />
      </div>

      <!-- Filtro de HORARI -->
      <h3>HORARI</h3>
      <div>
        <div
          @click="openHorariFilter = !openHorariFilter"
          class="select-header"
        >
          <span v-if="selectedHoraris.length === 0">Escull el horari...</span>
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
          <button class="btn-aplicar" @click="openHorariFilter = false">
            Aplicar
          </button>
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
    </div>
    <div class="lista-container">
      <div v-if="filteredTallers.length === 0" class="loading-state">
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

            <div class="desplegable">
              <SelectorAlumnos
                @toggle="(state) => actualizarPrioridad(curso.id, state)"
                @select="(num) => guardarSeleccion(curso.id, num)"
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

    <!-- Modal de Inscripció -->
    <div v-if="mostrarModalInsc" class="modal-overlay">
      <div class="modal-content">
        <h3>Dades de la Inscripció</h3>

        <div class="form-group">
          <label for="docent-ref">Docent de Referència (opcional):</label>
          <input
            id="docent-ref"
            v-model="docentRef"
            type="text"
            class="input-field"
            placeholder="Nom del docent"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label for="comentari">Comentari (opcional):</label>
          <textarea
            id="comentari"
            v-model="comentari"
            class="textarea-field"
            placeholder="Afegeix un comentari..."
            maxlength="191"
          ></textarea>
          <span class="char-count">{{ comentari.length }}/191</span>
        </div>

        <div class="modal-buttons">
          <button class="btn-cancel" @click="cerrarModal">Cancelar</button>
          <button class="btn-send" @click="confirmarEnvio">Enviar</button>
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
  height: 400px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
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
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
}
h3 {
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

/* --- BOTÓN GUARDAR --- */
.btn-guardar {
  background-color: #3949ab;
  border: 2px solid #3949ab;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  padding: 6px 12px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
  transition: all 0.3s ease;
}

.btn-guardar:hover {
  background-color: #7986cb;
  border-color: #7986cb;
}

.btn-guardar[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- FILTROS --- */
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

/* --- MODAL --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 15px;
  padding: 30px;
  width: 400px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid #3949ab;
}

.modal-content h3 {
  color: #3949ab;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #3949ab;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #c5cae9;
  border-radius: 8px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: #7986cb;
  box-shadow: 0 0 5px rgba(121, 134, 203, 0.3);
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  display: block;
  font-size: 0.8rem;
  color: #7986cb;
  margin-top: 5px;
  text-align: right;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
}

.btn-cancel,
.btn-send {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
  border: 1px solid #b0b0b0;
}

.btn-cancel:hover {
  background-color: #d0d0d0;
}

.btn-send {
  background-color: #3949ab;
  color: white;
  border: 2px solid #3949ab;
}

.btn-send:hover {
  background-color: #7986cb;
  border-color: #7986cb;
}
</style>
