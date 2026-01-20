<script setup>
import { ref, onMounted } from "vue";
import { getAllTallers } from "~/services/communicationManagerDatabase";

const tallers = ref([]);
const mostrarModal = ref(false);
const periodes = ref([]);

// Campos del formulario
const nom = ref("");
const descripcio = ref("");
const tallerista = ref("");
const placesMax = ref("");
const direccio = ref("");
const diaSeleccionado = ref("");
const horaInicio = ref("");
const horaFin = ref("");
const periodeSeleccionado = ref("");

const dias = [
  "Dilluns",
  "Dimarts",
  "Dimecres",
  "Dijous",
  "Divendres",
  "Dissabte",
  "Diumenge",
];

const cargarTallers = async () => {
  try {
    tallers.value = await getAllTallers();
    console.log("Tallers obtinguts:", tallers.value);
  } catch (error) {
    console.error("Error al obtenir els tallers:", error);
  }
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

const cargarPeriodes = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_URL_BACK || "http://localhost:8000"}/periodes`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!response.ok) throw new Error("Error al cargar periodes");
    periodes.value = await response.json();
    console.log("Periodes carregats:", periodes.value);
  } catch (error) {
    console.error("Error al cargar periodes:", error);
  }
};

onMounted(async () => {
  await cargarTallers();
  await cargarPeriodes();
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
    Septembre: "09",
    Octubre: "10",
    Novembre: "11",
    Desembre: "12",
  };
  return meses[mes] || "00";
};

const abrirModal = () => {
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  limpiarFormulario();
};

const limpiarFormulario = () => {
  nom.value = "";
  descripcio.value = "";
  tallerista.value = "";
  placesMax.value = "";
  direccio.value = "";
  diaSeleccionado.value = "";
  horaInicio.value = "";
  horaFin.value = "";
  periodeSeleccionado.value = "";
};

const crearTaller = async () => {
  // Validar campos obligatorios
  if (
    !nom.value ||
    !descripcio.value ||
    !tallerista.value ||
    !placesMax.value ||
    !direccio.value ||
    !diaSeleccionado.value ||
    !horaInicio.value ||
    !horaFin.value ||
    !periodeSeleccionado.value
  ) {
    alert("Tots els camps són obligatoris");
    return;
  }

  // Construir horari JSON
  const horariJSON = JSON.stringify({
    TORNS: [
      {
        DIA: diaSeleccionado.value,
        HORAINICI: horaInicio.value,
        HORAFI: horaFin.value,
      },
    ],
  });

  const dataTaller = {
    nom: nom.value,
    descripcio: descripcio.value,
    tallerista: tallerista.value,
    places_max: parseInt(placesMax.value),
    places_disp: parseInt(placesMax.value),
    direccio: direccio.value,
    horari: horariJSON,
    periode: parseInt(periodeSeleccionado.value),
    institucio: 1,
    admin: 1,
    autoritzat: false,
    modalitat: "C",
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_URL_BACK || "http://localhost:8000"}/tallers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataTaller),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear taller");
    }

    const resultado = await response.json();
    console.log("Taller creado:", resultado);
    alert("Taller creat correctament");
    cerrarModal();
    await cargarTallers();
  } catch (error) {
    console.error("Error al crear taller:", error);
    alert(`Error: ${error.message}`);
  }
};
</script>

<template>
  <div id="container">
    <div class="header-lista">
      <button id="btn-filtres">Filtres</button>
      <button id="btn-crear" @click="abrirModal">+ Crear Taller</button>
    </div>
    <div class="lista-container">
      <!-- CONTENEDOR: fila + desplegable debajo -->
      <div
        v-for="taller in tallers"
        :key="taller.id"
        class="curso-item"
        :class="{ abierto: filaActiva === taller.id }"
        :style="{ zIndex: filaActiva === taller.id ? 100 : 1 }"
      >
        <!-- FILA (barra superior) -->
        <div class="fila-curso">
          <div class="col-titulo">
            <span class="texto-titulo">{{ taller.nom }}</span>
          </div>

          <div class="col-info">
            <span class="info-item">
              <img src="/img/centro/location.png" class="icon" alt="icon" />
              {{ taller.direccio }}
            </span>
          </div>

          <button class="btn-detalls" @click="toggleDetalls(taller.id)">
            <span class="btn-detalls-text">
              {{ filaActiva === taller.id ? "− Detalls" : "+ Detalls" }}
            </span>
          </button>
        </div>

        <!-- DESPLEGABLE HACIA ABAJO -->
        <transition name="slide">
          <div v-if="filaActiva === taller.id" class="desplegable">
            <p><strong>Descripció:</strong>{{ taller.descripcio }}</p>
            <p><strong>Tallerista:</strong> {{ taller.tallerista }}</p>
            <p><strong>Places disponibles:</strong> {{ taller.places_disp }}</p>
            <p><strong>Modalitat:</strong> {{ taller.modalitat }}</p>
            <p>
              <img src="/img/centro/clock.png" class="icon" alt="icon" /><b
                >Horari:</b
              >
              {{ formatHorari(taller.horari) }}
            </p>
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
            <select id="periode" v-model="periodeSeleccionado" required>
              <option value="">Selecciona un periode</option>
              <option v-for="n in 6" :key="n" :value="n">{{ n }}</option>
            </select>
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

#btn-crear {
  background-color: #3949ab;
  color: white;
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

#btn-crear:hover {
  background-color: #5064cd;
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
  padding: 20px 0 0 0;
  border-radius: 0 0 25px 25px;
  box-sizing: border-box;
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

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
.mes-titulo {
  font-size: 1.5rem;
  color: #333;
  margin: 20px 0 10px 0;
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
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #3949ab;
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
  border-radius: 8px;
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
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #c5cae9;
  color: #333;
}

.btn-cancel:hover {
  background-color: #b0b5d9;
}

.btn-submit {
  background-color: #3949ab;
  color: white;
}

.btn-submit:hover {
  background-color: #5064cd;
}
</style>
