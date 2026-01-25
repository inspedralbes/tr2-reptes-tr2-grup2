<script setup>
import Swal from "sweetalert2";
import { ref, onMounted, computed } from "vue";
import { getImageUrl } from "@/utils/imageUtils";
import {
  getAllTallers,
  createTaller,
  getPeriodes,
  getSystemSettings,
  updateTaller,
  deleteTaller,
} from "~/services/communicationManagerDatabase";

const tallers = ref([]);
const mostrarModal = ref(false);
const mostrarEditar = ref(false);
const tallerSeleccionado = ref(null);
const periodes = ref([]);
const selectedPeriodeId = ref(null);

// Estados reactivos para filtros
const filterOpen = ref(false);
const openMonthFilter = ref(false);
const openHorariFilter = ref(false);
const selectedMonths = ref([]);
const selectedHoraris = ref([]);
const searchTaller = ref("");
const horaris = ref([]);

// Campos del formulario
const nom = ref("");
const descripcio = ref("");
const tallerista = ref("");
const mailtallerista = ref("");
const placesMax = ref("");
const direccio = ref("");
const diaSeleccionado = ref("");
const horaInicio = ref("");
const horaFin = ref("");
const periodeSeleccionado = ref("");
const imatgeFile = ref(null);
const dataInici = ref("");
const dataFi = ref("");

const dias = [
  "Dilluns",
  "Dimarts",
  "Dimecres",
  "Dijous",
  "Divendres",
  "Dissabte",
  "Diumenge",
];

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

const cargarTallers = async () => {
  try {
    tallers.value = await getAllTallers();
    // Extraer horarios únicos
    horaris.value = extractHoraris(tallers.value);
  } catch (error) {
    console.error("Error al obtenir els tallers:", error);
  }
};

const cargarSystemSettings = async () => {
  try {
    const settings = await getSystemSettings();
    selectedPeriodeId.value = settings.selectedPeriodeId;
  } catch (error) {
    console.error("Error al obtenir configuració:", error);
  }
};

const extractHoraris = (data) => {
  const horasSet = new Set();

  data.forEach((taller) => {
    try {
      const horari = JSON.parse(taller.horari);
      horasSet.add(horari?.TORNS?.[0]?.HORAINICI || "00:00");
    } catch (e) {
      horasSet.add("00:00");
    }
  });

  return Array.from(horasSet).sort();
};

const formatHorari = (horariJSON) => {
  try {
    const horari = JSON.parse(horariJSON);
    return horari.TORNS.map(
      (torn) => `${torn.DIA}: ${torn.HORAINICI} - ${torn.HORAFI}`,
    ).join(", ");
  } catch {
    return "No disponible";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("ca-ES", options);
};

const cargarPeriodes = async () => {
  try {
    periodes.value = await getPeriodes();
  } catch (error) {
    console.error("Error al cargar periodes:", error);
  }
};
onMounted(async () => {
  await cargarTallers();
  await cargarPeriodes();
  await cargarSystemSettings();
});

const filaActiva = ref(null);

const actualizarPrioridad = (id, isOpen) => {
  filaActiva.value = isOpen ? id : null;
};

// Toggle del desplegable al clicar el botón
const toggleDetalls = (id) => {
  filaActiva.value = filaActiva.value === id ? null : id;
};

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

const toggleMonthSelection = (mes) => {
  const index = selectedMonths.value.indexOf(mes);
  if (index === -1) {
    selectedMonths.value.push(mes);
  } else {
    selectedMonths.value.splice(index, 1);
  }
};

const removeMonth = (mes) => {
  selectedMonths.value = selectedMonths.value.filter((m) => m !== mes);
};

const toggleHorariSelection = (horari) => {
  const index = selectedHoraris.value.indexOf(horari);
  if (index === -1) {
    selectedHoraris.value.push(horari);
  } else {
    selectedHoraris.value.splice(index, 1);
  }
};

const removeHorari = (horari) => {
  selectedHoraris.value = selectedHoraris.value.filter((h) => h !== horari);
};

const getTallerMes = (taller) => {
  let horari = {};
  try {
    if (typeof taller.horari === "string" && taller.horari.trim() !== "") {
      horari = JSON.parse(taller.horari);
    } else if (taller.horari) {
      horari = taller.horari;
    }
  } catch (e) {
    horari = {};
  }
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
  const parts = (horari.DATAINI || "").split("/");
  const year = parts[2] ? parseInt(parts[2], 10) : null;
  const month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
  const dateObj = year && month >= 0 ? new Date(year, month, 1) : null;
  return dateObj ? mesesNombres[dateObj.getMonth()] : "Desconegut";
};

const getTallerHora = (taller) => {
  let horari = {};
  try {
    if (typeof taller.horari === "string" && taller.horari.trim() !== "") {
      horari = JSON.parse(taller.horari);
    } else if (taller.horari) {
      horari = taller.horari;
    }
  } catch (e) {
    horari = {};
  }
  return horari.TORNS?.[0]?.HORAINICI || "00:00";
};

const tallersFiltrados = computed(() => {
  let filtered = tallers.value;

  // Filtro por período (SIEMPRE activo si está seleccionado)
  if (selectedPeriodeId.value) {
    filtered = filtered.filter((t) => t.periode === selectedPeriodeId.value);
  }

  // Filtro por mes
  if (selectedMonths.value.length > 0) {
    filtered = filtered.filter((taller) => {
      const tallerMes = getTallerMes(taller);
      return selectedMonths.value.includes(tallerMes);
    });
  }

  // Filtro por horario
  if (selectedHoraris.value.length > 0) {
    filtered = filtered.filter((taller) => {
      const tallerHora = getTallerHora(taller);
      return selectedHoraris.value.includes(tallerHora);
    });
  }

  // Filtro por búsqueda de nombre
  if (searchTaller.value.trim() !== "") {
    const busqueda = searchTaller.value.toLowerCase();
    filtered = filtered.filter((taller) => {
      return taller.nom.toLowerCase().includes(busqueda);
    });
  }

  return filtered;
});

const periodeActiuInfo = computed(() => {
  const periode = periodes.value.find((p) => p.id === selectedPeriodeId.value);
  if (periode) {
    return `${formatDate(periode.dataIni)} - ${formatDate(periode.dataFi)}`;
  }
  return "";
});

const abrirModal = () => {
  mostrarModal.value = true;
  periodeSeleccionado.value = String(selectedPeriodeId.value || "");
};

const abrirModalEditar = (taller) => {
  mostrarEditar.value = true;
  tallerSeleccionado.value = taller;
  nom.value = taller.nom || "";
  descripcio.value = taller.descripcio || "";
  tallerista.value = taller.tallerista || "";
  mailtallerista.value = taller.mailTallerista || "";
  placesMax.value = (taller.places_max ?? taller.places_disp ?? "") + "";
  direccio.value = taller.direccio || "";
  // Parsejar horari per omplir DIA/HORAINICI/HORAFI/DATAINI/DATAFI
  try {
    let horari = {};
    if (typeof taller.horari === "string" && taller.horari.trim() !== "") {
      horari = JSON.parse(taller.horari);
    } else if (taller.horari) {
      horari = taller.horari;
    }
    const torn = horari?.TORNS?.[0] || {};
    diaSeleccionado.value = torn.DIA || "";
    horaInicio.value = torn.HORAINICI || "";
    horaFin.value = torn.HORAFI || "";
    dataInici.value = horari.DATAINI || "";
    dataFi.value = horari.DATAFI || "";
  } catch (e) {
    diaSeleccionado.value = "";
    horaInicio.value = "";
    horaFin.value = "";
    dataInici.value = "";
    dataFi.value = "";
  }
  // Periode (esperat com a enter)
  periodeSeleccionado.value = (taller.periode ?? "") + "";
  imatgeFile.value = null;
};
const cerrarModal = () => {
  mostrarModal.value = false;
  limpiarFormulario();
};

const cerrarModalEditar = () => {
  mostrarEditar.value = false;
  tallerSeleccionado.value = null;
  limpiarFormulario();
};

const limpiarFormulario = () => {
  nom.value = "";
  descripcio.value = "";
  tallerista.value = "";
  mailtallerista.value = "";
  placesMax.value = "";
  direccio.value = "";
  diaSeleccionado.value = "";
  horaInicio.value = "";
  horaFin.value = "";
  periodeSeleccionado.value = "";
  dataInici.value = "";
  dataFi.value = "";
  imatgeFile.value = null;
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imatgeFile.value = file;
  }
};

const crearTaller = async () => {
  // Validar campos obligatorios
  if (
    !nom.value ||
    !descripcio.value ||
    !tallerista.value ||
    !mailtallerista.value ||
    !placesMax.value ||
    !direccio.value ||
    !diaSeleccionado.value ||
    !horaInicio.value ||
    !horaFin.value ||
    !periodeSeleccionado.value ||
    !dataInici.value ||
    !dataFi.value
  ) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Tots els camps són obligatoris",
      confirmButtonText: "Tancar",
    });
    return;
  }

  // Construir horari JSON
  const horariJSON = JSON.stringify({
    DATAINI: dataInici.value,
    DATAFI: dataFi.value,
    TORNS: [
      {
        DIA: diaSeleccionado.value,
        HORAINICI: horaInicio.value,
        HORAFI: horaFin.value,
      },
    ],
  });

  // Crear FormData per enviar dades i fitxer
  const formData = new FormData();
  formData.append("nom", nom.value);
  formData.append("descripcio", descripcio.value);
  formData.append("tallerista", tallerista.value);
  formData.append("mailTallerista", mailtallerista.value);
  formData.append("places_max", Number.parseInt(placesMax.value));
  formData.append("places_disp", Number.parseInt(placesMax.value));
  formData.append("direccio", direccio.value);
  formData.append("horari", horariJSON);
  formData.append("periode", Number.parseInt(periodeSeleccionado.value));
  formData.append("institucio", 1);
  formData.append("admin", 1);
  formData.append("autoritzat", false);
  formData.append("modalitat", "C");

  // Agregar imagen si se seleccionó una
  if (imatgeFile.value) {
    formData.append("imatge", imatgeFile.value);
  }

  try {
    const resultado = await createTaller(formData);
    Swal.fire({
      icon: "success",
      title: "Éxit",
      text: "Taller creat correctament",
      confirmButtonText: "Tancar",
    });
    cerrarModal();
    await cargarTallers();
  } catch (error) {
    console.error("Error al crear taller:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: `Error: ${error.message}`,
      confirmButtonText: "Tancar",
    });
  }
};

const actualizarTaller = async () => {
  // Validar camps obligatoris
  if (
    !tallerSeleccionado.value?.id ||
    !nom.value ||
    !descripcio.value ||
    !tallerista.value ||
    !mailtallerista.value ||
    !placesMax.value ||
    !direccio.value ||
    !diaSeleccionado.value ||
    !horaInicio.value ||
    !horaFin.value ||
    !periodeSeleccionado.value ||
    !dataInici.value ||
    !dataFi.value
  ) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Tots els camps són obligatoris",
      confirmButtonText: "Tancar",
    });
    return;
  }

  // Construir horari JSON
  const horariJSON = JSON.stringify({
    DATAINI: dataInici.value,
    DATAFI: dataFi.value,
    TORNS: [
      {
        DIA: diaSeleccionado.value,
        HORAINICI: horaInicio.value,
        HORAFI: horaFin.value,
      },
    ],
  });

  // Crear FormData amb dades i fitxer (PUT backend espera body i possible imatge)
  const formData = new FormData();
  formData.append("id", String(tallerSeleccionado.value.id));
  formData.append("nom", nom.value);
  formData.append("descripcio", descripcio.value);
  formData.append("tallerista", tallerista.value);
  formData.append("mailTallerista", mailtallerista.value);
  formData.append("places_max", Number.parseInt(placesMax.value));
  // Manté places_disp si no hi ha lògica específica (aquí igualem a places_max per simplicitat si cal)
  formData.append(
    "places_disp",
    Number.parseInt(
      String(tallerSeleccionado.value.places_disp ?? placesMax.value),
    ),
  );
  formData.append("direccio", direccio.value);
  formData.append("horari", horariJSON);
  formData.append("periode", Number.parseInt(periodeSeleccionado.value));
  formData.append(
    "institucio",
    Number.parseInt(String(tallerSeleccionado.value.institucio ?? 1)),
  );
  formData.append(
    "admin",
    Number.parseInt(String(tallerSeleccionado.value.admin ?? 1)),
  );
  formData.append(
    "autoritzat",
    (tallerSeleccionado.value.autoritzat ?? false) ? "true" : "false",
  );
  formData.append("modalitat", tallerSeleccionado.value.modalitat || "C");

  // Afegir imatge si s'ha seleccionat una nova
  if (imatgeFile.value) {
    formData.append("imatge", imatgeFile.value);
  }

  try {
    const resultado = await updateTaller(formData);
    Swal.fire({
      icon: "success",
      title: "Éxit",
      text: "Taller actualitzat correctament",
      confirmButtonText: "Tancar",
    });
    cerrarModalEditar();
    await cargarTallers();
  } catch (error) {
    console.error("Error al actualitzar taller:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: `Error: ${error.message}`,
      confirmButtonText: "Tancar",
    });
  }
};

const onImgError = (e) => {
  e.target.src = getImageUrl(null);
};

async function confirmarEliminar(id) {
  const result = await Swal.fire({
    title: "Estas segur?",
    text: "No podràs revertir això!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Cancel·la",
    confirmButtonText: "Sí, elimina-ho!",
  });

  if (result.isConfirmed) {
    await deleteTaller(id)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Éxit",
          text: "Taller eliminat correctament",
          confirmButtonText: "Tancar",
        });
        cargarTallers();
      })
      .catch((error) => {
        console.error("Error al eliminar taller:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error: ${error.message}`,
          confirmButtonText: "Tancar",
        });
      });
  }
}
</script>
<template>
  <div id="container">
    <div class="header-lista">
      <div class="buttons-group">
        <button id="btn-crear" @click="abrirModal">+ Crear Taller</button>
      </div>
      <button id="btn-filtres" @click="filterOpen = !filterOpen">
        Filtres
      </button>
    </div>

    <!-- POPUP DE FILTRES -->
    <div v-if="filterOpen" id="popup-filter">
      <button @click="filterOpen = false">x</button>

      <!-- Filtro de MES -->
      <h3>MES</h3>
      <div>
        <div @click="openMonthFilter = !openMonthFilter" class="select-header">
          <span v-if="selectedMonths.length === 0">Escull el mes...</span>
          <span v-else>{{ selectedMonths.length }} meses seleccionats</span>
          <span class="arrow" :class="{ rotated: openMonthFilter }">▲</span>
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
          <span class="arrow" :class="{ rotated: openHorariFilter }">▲</span>
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
      <!-- CONTENEDOR: fila + desplegable debajo -->
      <div v-if="tallersFiltrados.length === 0" class="loading-state">
        No hi ha tallers disponibles
      </div>

      <div
        v-for="taller in tallersFiltrados"
        :key="taller.id"
        class="bloque-curso"
      >
        <div
          class="fila-curso"
          :style="{ zIndex: filaActiva === taller.id ? 100 : 1 }"
        >
          <div class="col-titulo">
            <img
              :src="getImageUrl(taller)"
              class="img-curso"
              alt="curso"
              @error="onImgError"
            />
          </div>

          <div class="col-info">
            <div class="text-info">
              <span class="texto-titulo">{{ taller.nom }}</span
              ><br />
              <span class="info-item">
                <img src="/img/centro/location.png" class="icon" alt="icon" />
                {{ taller.direccio }}
              </span>
            </div>
          </div>

          <button class="btn-detalls" @click="toggleDetalls(taller.id)">
            <span
              class="btn-detalls-text"
              :class="{ rotar: filaActiva === taller.id }"
              >+</span
            >
          </button>

          <button id="btn-editar-taller" @click="abrirModalEditar(taller)">
            Editar
          </button>

          <button
            id="btn-eliminar-taller"
            @click="confirmarEliminar(taller.id)"
          >
            Eliminar
          </button>
        </div>

        <!-- DESPLEGABLE DE INFORMACIÓN -->
        <transition name="fade-slide">
          <div v-if="filaActiva === taller.id" class="info-desplegable">
            <div class="contenido-detalle">
              <p><strong>Descripció:</strong> {{ taller.descripcio }}</p>
              <p>
                <strong>Tallerista:</strong> {{ taller.tallerista }} ({{
                  taller.mailTallerista
                }})
              </p>
              <p>
                <strong>Places disponibles:</strong> {{ taller.places_disp }}
              </p>
              <p><strong>Modalitat:</strong> {{ taller.modalitat }}</p>
              <p>Comença el: {{ JSON.parse(taller.horari).DATAINI }}</p>
              <p>Finalitza el: {{ JSON.parse(taller.horari).DATAFI }}</p>
              <p>
                <b>Horari - </b>
                {{ formatHorari(taller.horari) }}
              </p>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- MODAL CREAR TALLER -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Crear Nou Taller</h2>
          <button class="btn-close" @click="cerrarModal">✕</button>
        </div>

        <form @submit.prevent="crearTaller" class="modal-form">
          <!-- Nom -->
          <div class="form-group">
            <label for="nom">Nom del Taller *</label>
            <input
              id="nom"
              v-model="nom"
              type="text"
              placeholder="Ej: Robòtica Avançada"
              maxlength="191"
              required
            />
          </div>

          <!-- Descripció -->
          <div class="form-group">
            <label for="descripcio">Descripció *</label>
            <textarea
              id="descripcio"
              v-model="descripcio"
              placeholder="Descripcio detallada del taller"
              rows="3"
              required
            ></textarea>
          </div>

          <!-- Tallerista -->
          <div class="form-group">
            <label for="tallerista">Tallerista *</label>
            <input
              id="tallerista"
              v-model="tallerista"
              type="text"
              maxlength="191"
              required
            />
          </div>

          <!-- Mail Tallerista -->
          <div class="form-group">
            <label for="mailtallerista">Mail Tallerista *</label>
            <input
              id="mailtallerista"
              v-model="mailtallerista"
              type="email"
              placeholder="tallerista@example.com"
              maxlength="191"
              required
            />
          </div>

          <!-- Places Màximes -->
          <div class="form-group">
            <label for="placesMax">Places Màximes *</label>
            <input
              id="placesMax"
              v-model="placesMax"
              type="number"
              min="1"
              required
            />
          </div>

          <!-- Direcció -->
          <div class="form-group">
            <label for="direccio">Direcció *</label>
            <input
              id="direccio"
              v-model="direccio"
              type="text"
              placeholder="c. Salvador Espriu, 3"
              maxlength="191"
              required
            />
          </div>

          <!-- Data Inici -->
          <div class="form-group">
            <label for="dataini">Data Inici *</label>
            <input id="dataini" v-model="dataInici" type="date" required />
          </div>

          <!-- Data Fi -->
          <div class="form-group">
            <label for="datafi">Data Fi *</label>
            <input id="datafi" v-model="dataFi" type="date" required />
          </div>

          <!-- Dia de la setmana -->
          <div class="form-group">
            <label for="dia">Dia de la Setmana *</label>
            <select id="dia" v-model="diaSeleccionado" required>
              <option value="">Selecciona un dia</option>
              <option v-for="dia in dias" :key="dia" :value="dia">
                {{ dia }}
              </option>
            </select>
          </div>

          <!-- Hora Inici -->
          <div class="form-group">
            <label for="horaInicio">Hora Inici *</label>
            <input id="horaInicio" v-model="horaInicio" type="time" required />
          </div>

          <!-- Hora Final -->
          <div class="form-group">
            <label for="horaFin">Hora Final *</label>
            <input id="horaFin" v-model="horaFin" type="time" required />
          </div>

          <!-- Periode -->
          <div class="form-group">
            <label for="periode">Periode *</label>
            <input
              id="periode"
              :value="periodeActiuInfo"
              type="text"
              disabled
            />
            <small style="color: #666; margin-top: 5px">Periode actual</small>
          </div>

          <!-- Imatge -->
          <div class="form-group">
            <label for="imatge">Imatge del Taller</label>
            <input
              id="imatge"
              type="file"
              accept="image/*"
              @change="handleFileChange"
            />
            <small style="color: #666; margin-top: 5px"
              >Format: JPG, PNG, GIF (opcional)</small
            >
          </div>

          <!-- Botones -->
          <div class="modal-buttons">
            <button type="button" class="btn-cancel" @click="cerrarModal">
              Cancelar
            </button>
            <button type="submit" class="btn-submit">Crear Taller</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR TALLER -->
    <div v-if="mostrarEditar" class="modal-overlay" @click="cerrarModalEditar">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Editar Taller</h2>
          <button class="btn-close" @click="cerrarModalEditar">✕</button>
        </div>

        <form @submit.prevent="actualizarTaller" class="modal-form">
          <!-- Nom -->
          <div class="form-group">
            <label for="nom-edit">Nom del Taller *</label>
            <input
              id="nom-edit"
              v-model="nom"
              type="text"
              placeholder="Ej: Robòtica Avançada"
              maxlength="191"
              required
            />
          </div>

          <!-- Descripció -->
          <div class="form-group">
            <label for="descripcio-edit">Descripció *</label>
            <textarea
              id="descripcio-edit"
              v-model="descripcio"
              placeholder="Descripcio detallada del taller"
              rows="3"
              required
            ></textarea>
          </div>

          <!-- Tallerista -->
          <div class="form-group">
            <label for="tallerista-edit">Tallerista *</label>
            <input
              id="tallerista-edit"
              v-model="tallerista"
              type="text"
              maxlength="191"
              required
            />
          </div>

          <!-- Mail Tallerista -->
          <div class="form-group">
            <label for="mailtallerista-edit">Mail Tallerista *</label>
            <input
              id="mailtallerista-edit"
              v-model="mailtallerista"
              type="email"
              placeholder="tallerista@example.com"
              maxlength="191"
              required
            />
          </div>

          <!-- Places Màximes -->
          <div class="form-group">
            <label for="placesMax-edit">Places Màximes *</label>
            <input
              id="placesMax-edit"
              v-model="placesMax"
              type="number"
              min="1"
              required
            />
          </div>

          <!-- Direcció -->
          <div class="form-group">
            <label for="direccio-edit">Direcció *</label>
            <input
              id="direccio-edit"
              v-model="direccio"
              type="text"
              placeholder="c. Salvador Espriu, 3"
              maxlength="191"
              required
            />
          </div>

          <!-- Data Inici -->
          <div class="form-group">
            <label for="dataini-edit">Data Inici *</label>
            <input id="dataini-edit" v-model="dataInici" type="date" required />
          </div>

          <!-- Data Fi -->
          <div class="form-group">
            <label for="datafi-edit">Data Fi *</label>
            <input id="datafi-edit" v-model="dataFi" type="date" required />
          </div>

          <!-- Data Inici -->
          <div class="form-group">
            <label for="dataini-edit">Data Inici *</label>
            <input id="dataini-edit" v-model="dataInici" type="date" required />
          </div>

          <!-- Data Fi -->
          <div class="form-group">
            <label for="datafi-edit">Data Fi *</label>
            <input id="datafi-edit" v-model="dataFi" type="date" required />
          </div>

          <!-- Dia de la setmana -->
          <div class="form-group">
            <label for="dia-edit">Dia de la Setmana *</label>
            <select id="dia-edit" v-model="diaSeleccionado" required>
              <option value="">Selecciona un dia</option>
              <option v-for="dia in dias" :key="dia" :value="dia">
                {{ dia }}
              </option>
            </select>
          </div>

          <!-- Hora Inici -->
          <div class="form-group">
            <label for="horaInicio-edit">Hora Inici *</label>
            <input
              id="horaInicio-edit"
              v-model="horaInicio"
              type="time"
              required
            />
          </div>

          <!-- Hora Final -->
          <div class="form-group">
            <label for="horaFin-edit">Hora Final *</label>
            <input id="horaFin-edit" v-model="horaFin" type="time" required />
          </div>

          <!-- Periode -->
          <div class="form-group">
            <label for="periode-edit">Periode *</label>
            <select id="periode-edit" v-model="periodeSeleccionado" required>
              <option value="">Selecciona un periode</option>
              <option
                v-for="periode in periodes"
                :key="periode.id"
                :value="periode.id"
              >
                {{ formatDate(periode.dataIni) }} -
                {{ formatDate(periode.dataFi) }}
              </option>
            </select>
          </div>

          <!-- Imatge -->
          <div class="form-group">
            <label for="imatge-edit">Imatge del Taller</label>
            <input
              id="imatge-edit"
              type="file"
              accept="image/*"
              @change="handleFileChange"
            />
            <small style="color: #666; margin-top: 5px"
              >Format: JPG, PNG, GIF (opcional)</small
            >
          </div>

          <!-- Botones -->
          <div class="modal-buttons">
            <button type="button" class="btn-cancel" @click="cerrarModalEditar">
              Cancelar
            </button>
            <button type="submit" class="btn-submit">Guardar canvis</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  font-family: Arial, Helvetica, sans-serif;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 2px solid #87878748;
  height: calc(100vh - 250px);
  /* Altura ajustada para scroll interno */
  min-height: 400px;
  background-color: #ffffff;
}

.header-lista {
  display: flex;
  justify-content: right;
  align-items: center;
  gap: 140px;
  margin-bottom: 15px;
  margin-top: 40px;
  padding-right: 0;
  margin-right: 40px;
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

#btn-crear {
  background-color: #d8dcf5;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 22px;
  border: 5px solid #b0b7e3;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

#btn-crear:hover {
  background-color: #7987cbb6;
  transform: translateY(-1px);
  border: 5px solid #3949ab70;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
}

.buttons-group {
  display: flex;
  gap: 20px;
}

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

.loading-state {
  text-align: center;
  padding: 40px;
  color: #7986cb;
  font-weight: bold;
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
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -110px;
  z-index: 2;
  width: clamp(350px, 35vw, 650px);
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-left: 30px;
  border-radius: 250px;
}

.text-info {
  font-weight: bold;
  margin-left: 20%;
  margin-top: 30px;
  font-size: clamp(1rem, 1.5vw, 1.5rem);
}

.btn-detalls {
  background-color: #c5cae9;
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

#btn-editar-taller {
  background-color: #9facfe;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-style: solid;
  border-width: 4px;
  border-color: #717ed3;
  border-radius: 30px;
  cursor: pointer;
  margin-left: 90px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

#btn-editar-taller:hover {
  background-color: #6878db;
  border-color: #4956aa;
  transform: translateY(-2px);
}

#btn-eliminar-taller {
  background-color: #808bd1;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-style: solid;
  border-width: 4px;
  border-color: #5762aa;
  border-radius: 30px;
  cursor: pointer;
  margin-left: 40px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

#btn-eliminar-taller:hover {
  background-color: #545ea3;
  border-color: #3c4686;
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

/* --- DESPLEGABLE DE INFORMACIÓN --- */
.info-desplegable {
  margin-left: 153px;
  background-color: #d5dafb;
  width: clamp(350px, 35vw, 650px);
  margin-top: -60px;
  padding: 70px 20px 15px 40px;
  border-radius: 0 0 30px 30px;
  z-index: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.contenido-detalle {
  color: #2c2c2c;
  font-size: 0.85rem;
  line-height: 1.4;
}

.contenido-detalle p {
  padding: 0 0 8px 0;
  margin: 0;
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

.icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  border-style: solid;
  border-width: 2px;
  border-color: #dbdbdb;
  padding: 30px;
  width: 85%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #3948ab33;
  padding-bottom: 15px;
}

.modal-header h2 {
  color: #3949ab;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
}

.btn-close:hover {
  color: #000;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px;
  border: 1px solid #c5cae9;
  border-radius: 30px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  color: #333;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3949ab;
  background-color: #f5f7ff;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  border-radius: 8px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #b0b5d9;
  border-color: #878cb4;
  border-style: solid;
  border-width: 4px;
  color: #333;
}

.btn-cancel:hover {
  background-color: #c5cae9;
  border-color: #8e94c0;
}

.btn-submit {
  background-color: #4654af;
  border-color: #303869;
  border-style: solid;
  border-width: 4px;
  color: white;
}

.btn-submit:hover {
  background-color: #5064cd;
  border-color: #424d91;
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

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}
</style>
