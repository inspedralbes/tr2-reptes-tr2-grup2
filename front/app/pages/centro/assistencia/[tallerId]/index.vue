<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import Encabezado from "@/layouts/encabezado.vue";
import {
  getTallerById,
  getAssistenciesByTallerId,
  updateAssistencia,
  updateTaller,
  getAllInstitucions,
} from "@/services/communicationManagerDatabase";

//ejemplo para ver esta pagina: http://localhost:3000/centro/assistencia/1
//teneis que tener datos que corresponden a esos ids en la base de datos
//tanto en assistencias como en tallers etc
const route = useRoute();

// Obtener IDs de la URL
const TALLER_ID = parseInt(route.params.tallerId) || 1;

// Estats reactius
const taller = ref(null);
const assistencies = ref([]);
const cargando = ref(true);
const error = ref(null);
const institucions = ref([]);
const instMap = ref({});

// Modal
const mostrarModal = ref(false);
const diaSeleccionat = ref(null);
const alumnesDelDia = ref([]);
const professorsDelDia = ref([]);
const guardant = ref(false);
const comentari = ref("");

const horariParsed = computed(() => {
  if (!taller.value || !taller.value.horari) return null;
  try {
    return JSON.parse(taller.value.horari);
  } catch (e) {
    return null;
  }
});

const formatDia = (diaStr) => {
  const data = new Date(diaStr);
  const opcions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return data.toLocaleDateString("ca-ES", opcions);
};

const getInfoTorn = (diaStr) => {
  if (!horariParsed.value || !horariParsed.value.TORNS) return "";
  const data = new Date(diaStr);
  const diesSetmana = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"];
  const diaNom = diesSetmana[data.getDay()];
  const torn = horariParsed.value.TORNS.find((t) => t.DIA === diaNom);
  if (torn) {
    return `${torn.HORAINICI} - ${torn.HORAFI}`;
  }
  return "";
};

const obrirModal = (assistencia) => {
  diaSeleccionat.value = assistencia;
  comentari.value = taller.value?.comentari_tallerista || "";
  // Procesar alumnos
  try {
    const alumnesParsed = JSON.parse(assistencia.llista_alumnes || "[]");
    const alumnesFiltrats = [];

    for (let i = 0; i < alumnesParsed.length; i++) {
      const alumne = alumnesParsed[i];
      const nouAlumne = {};
      for (const key in alumne) {
        nouAlumne[key] = alumne[key];
      }
      nouAlumne.INSTITUT_ORIGINAL = alumne.INSTITUT;
      if (instMap.value[alumne.INSTITUT]) {
        nouAlumne.INSTITUT = instMap.value[alumne.INSTITUT];
      }
      alumnesFiltrats.push(nouAlumne);
    }
    alumnesDelDia.value = alumnesFiltrats;
  } catch (e) {
    alumnesDelDia.value = [];
  }

  try {
    const profeParsed = JSON.parse(assistencia.llista_professors || "[]");
    const profesFiltrats = [];

    for (let i = 0; i < profeParsed.length; i++) {
      const prof = profeParsed[i];
      const nouProf = {};
      for (const key in prof) {
        nouProf[key] = prof[key];
      }
      nouProf.INSTITUT_ORIGINAL = prof.INSTITUT;
      if (instMap.value[prof.INSTITUT]) {
        nouProf.INSTITUT = instMap.value[prof.INSTITUT];
      }
      profesFiltrats.push(nouProf);
    }
    professorsDelDia.value = profesFiltrats;
  } catch (e) {
    professorsDelDia.value = [];
  }

  mostrarModal.value = true;
};

const tancarModal = () => {
  mostrarModal.value = false;
  diaSeleccionat.value = null;
  alumnesDelDia.value = [];
  professorsDelDia.value = [];
  comentari.value = "";
};

const toggleAssistenciaAlumne = (index) => {
  alumnesDelDia.value[index].ASSISTENCIA = !alumnesDelDia.value[index].ASSISTENCIA;
  // Si marca que ha assistit, treure justificat
  if (alumnesDelDia.value[index].ASSISTENCIA) {
    alumnesDelDia.value[index].JUSTIFICAT = false;
  }
};

// Canviar justificat d'un alumne (només si no ha assistit)
const toggleJustificatAlumne = (index) => {
  if (!alumnesDelDia.value[index].ASSISTENCIA) {
    alumnesDelDia.value[index].JUSTIFICAT = !alumnesDelDia.value[index].JUSTIFICAT;
  }
};

// Canviar assistència d'un professor
const toggleAssistenciaProfe = (index) => {
  professorsDelDia.value[index].ASSISTENCIA = !professorsDelDia.value[index].ASSISTENCIA;
  if (professorsDelDia.value[index].ASSISTENCIA) {
    professorsDelDia.value[index].JUSTIFICAT = false;
  }
};

// Canviar justificat d'un professor
const toggleJustificatProfe = (index) => {
  if (!professorsDelDia.value[index].ASSISTENCIA) {
    professorsDelDia.value[index].JUSTIFICAT = !professorsDelDia.value[index].JUSTIFICAT;
  }
};

// Guardar canvis d'assistència
const guardarAssistencia = async () => {
  if (!diaSeleccionat.value) return;

  guardant.value = true;
  try {
    // Preparar arrays de alumnos
    const alumnesParaGuardar = alumnesDelDia.value.map(a => ({
      NOM: a.NOM,
      INSTITUT: a.INSTITUT_ORIGINAL || a.INSTITUT,
      ASSISTENCIA: a.ASSISTENCIA,
      JUSTIFICAT: a.JUSTIFICAT
    }));

    const profsParaGuardar = professorsDelDia.value.map(p => ({
      NOM: p.NOM,
      INSTITUT: p.INSTITUT_ORIGINAL || p.INSTITUT,
      ASSISTENCIA: p.ASSISTENCIA,
      JUSTIFICAT: p.JUSTIFICAT
    }));

    const dataToUpdate = {
      id: diaSeleccionat.value.id,
      llista_alumnes: JSON.stringify(alumnesParaGuardar),
      llista_professors: JSON.stringify(profsParaGuardar),
    };

    await updateAssistencia(dataToUpdate);

    // Actualitzar la llista local
    const index = assistencies.value.findIndex((a) => a.id === diaSeleccionat.value.id);
    if (index !== -1) {
      assistencies.value[index].llista_alumnes = dataToUpdate.llista_alumnes;
      assistencies.value[index].llista_professors = dataToUpdate.llista_professors;
    }

    // Guardar el comentari del tallerista
    if (comentari.value !== (taller.value?.comentari_tallerista || "")) {
      await updateTaller(TALLER_ID, {
        comentari_tallerista: comentari.value
      });
      // Actualizar el taller localmente
      if (taller.value) {
        taller.value.comentari_tallerista = comentari.value;
      }
    }

    tancarModal();
  } catch (err) {
    console.error("Error al guardar assistència:", err);
    alert("Error al guardar l'assistència");
  } finally {
    guardant.value = false;
  }
};

// Guardar comentari del tallerista
const guardarComentari = async () => {
  if (!taller.value) return;

  try {
    // Guardar el comentari del tallerista
    await updateTaller(TALLER_ID, {
      comentari_tallerista: comentari.value
    });
    // Actualizar el taller localmente
    if (taller.value) {
      taller.value.comentari_tallerista = comentari.value;
    }
    alert("Comentari guardat correctament!");
  } catch (err) {
    console.error("Error al guardar comentari:", err);
    alert("Error al guardar el comentari");
  }
};

// Tancar el bloc de comentaris
const tancarComentari = () => {
  mostrarModal.value = false;
  comentari.value = "";
};

// Carregar dades
onMounted(async () => {
  try {
    cargando.value = true;

    // Obtenir institucions per mapareig
    const listaInst = await getAllInstitucions();
    listaInst.forEach(inst => {
      instMap.value[inst.id] = inst.nom;
    });

    // Obtenir dades del taller
    taller.value = await getTallerById(TALLER_ID);

    // Obtenir assistències del taller
    assistencies.value = await getAssistenciesByTallerId(TALLER_ID);

  } catch (err) {
    console.error("Error carregant dades:", err);
    error.value = err.message;
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <div id="cuerpo">
    <div id="contenido">
      <!-- Títol del taller -->
      <div class="header">
        <h2 v-if="taller">{{ taller.nom }}</h2>
        <h2 v-else>Carregant taller...</h2>
      </div>

      <!-- Missatge de càrrega -->
      <div v-if="cargando" class="loading">
        <p>Carregant dades...</p>
      </div>

      <!-- Missatge d'error -->
      <div v-else-if="error" class="error">
        <p>Error: {{ error }}</p>
      </div>

      <!-- Llista de dies -->
      <div v-else class="llista-dies">
        <h3>Dies d'assistència</h3>

        <div v-if="assistencies.length === 0" class="no-dies">
          <p>No hi ha dies d'assistència registrats per aquest taller.</p>
        </div>

        <div v-else class="dies-container">
          <div v-for="assistencia in assistencies" :key="assistencia.id" class="dia-item"
            @click="obrirModal(assistencia)">
            <div class="dia-info">
              <span class="dia-data">{{ formatDia(assistencia.dia) }}</span>
              <span class="dia-horari">{{ getInfoTorn(assistencia.dia) }}</span>
            </div>
          </div>
        </div>

        <!-- Bloc de comentaris -->
        <div class="comentaris-section">
          <h3>Comentari sobre la sessió</h3>
          <textarea v-model="comentari" placeholder="Afegeix comentaris sobre el taller (màxim 300 caràcters)"
            maxlength="300" class="textarea-comentari"></textarea>
          <div class="char-counter">{{ comentari.length }}/300</div>
          <div class="comentari-actions">
            <button class="btn-guardar-comentari" @click="guardarComentari">
              Guardar comentari
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal d'assistència -->
  <div v-if="mostrarModal" class="modal-overlay" @click.self="tancarModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Assistència - {{ diaSeleccionat ? formatDia(diaSeleccionat.dia) : "" }}</h3>
        <button class="btn-tancar" @click="tancarModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Taula Alumnes -->
        <div class="taula-section">
          <h4>Alumnes</h4>
          <table v-if="alumnesDelDia.length > 0">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Institut</th>
                <th>Ha assistit</th>
                <th>Justificat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alumne, index) in alumnesDelDia" :key="index">
                <td>{{ alumne.NOM }}</td>
                <td>{{ alumne.INSTITUT }}</td>
                <td>
                  <input type="checkbox" :checked="alumne.ASSISTENCIA" @change="toggleAssistenciaAlumne(index)" />
                </td>
                <td>
                  <input type="checkbox" :checked="alumne.JUSTIFICAT" :disabled="alumne.ASSISTENCIA"
                    @change="toggleJustificatAlumne(index)" />
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-dades">No hi ha alumnes registrats.</p>
        </div>

        <!-- Taula Professors -->
        <div class="taula-section">
          <h4>Professors</h4>
          <table v-if="professorsDelDia.length > 0">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Institut</th>
                <th>Ha assistit</th>
                <th>Justificat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(profe, index) in professorsDelDia" :key="index">
                <td>{{ profe.NOM }}</td>
                <td>{{ profe.INSTITUT }}</td>
                <td>
                  <input type="checkbox" :checked="profe.ASSISTENCIA" @change="toggleAssistenciaProfe(index)" />
                </td>
                <td>
                  <input type="checkbox" :checked="profe.JUSTIFICAT" :disabled="profe.ASSISTENCIA"
                    @change="toggleJustificatProfe(index)" />
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-dades">No hi ha professors registrats.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancelar" @click="tancarModal">Cancel·lar</button>
        <button class="btn-guardar" @click="guardarAssistencia" :disabled="guardant">
          {{ guardant ? "Guardant..." : "Guardar" }}
        </button>
      </div>
    </div>
  </div>

</template>

<style scoped>
@font-face {
  font-family: "Coolvetica";
  src: url(/assets/fuentes/coolvetica/Coolvetica\ Rg.otf);
}

#cuerpo {
  display: flex;
  min-height: calc(100vh - 85px);
  overflow-y: auto;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 40px;
}

#contenido {
  margin-top: 40px;
  margin-left: 20%;
  font-family: "Coolvetica";
  font-weight: lighter;
  width: 1000px;
  max-width: 95%;
  background-color: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.header h2 {
  font-size: 2rem;
  font-weight: lighter;
  color: #333;
  margin-bottom: 30px;
  margin-top: 0;
  text-align: center;
}

/* ... (rest of styles) ... */

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  font-family: "Coolvetica";
}

.modal-content {
  background-color: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 2px solid #7986cb;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;

}

.modal-header h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin: 0;
  color: #3949ab;
  border-bottom: 1px solid #eee;
}

.btn-tancar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7986cb;
  transition: color 0.2s;
}

.btn-tancar:hover {
  color: #303f9f;
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.taula-section h4 {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #333;
  border-left: 4px solid #7986cb;
  padding-left: 10px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.95rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #e8eaf6;
  font-weight: bold;
  color: #3949ab;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background-color: #f5f6fa;
}

/* Checkboxes custom style */
td input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3949ab;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
}

.btn-cancelar {
  background-color: #e0e0e0;
  border: 2px solid #bdbdbd;
  color: #333;
  padding: 8px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancelar:hover {
  background-color: #d6d6d6;
  border-color: #9e9e9e;
  transform: translateY(-2px);
}

.btn-guardar {
  background-color: #7986cb;
  border: 2px solid #3949ab;
  color: #fff;
  padding: 8px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(57, 73, 171, 0.2);
}

.btn-guardar:hover {
  background-color: #5c6bc0;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(57, 73, 171, 0.3);
}

.btn-guardar:disabled {
  background-color: #9fa8da;
  border-color: #7986cb;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Botones genéricos de acción en la página principal */
.btn-guardar-comentari {
  margin-top: 1%;
  margin-left: 77%;
  background-color: #7986cb;
  border: 3px solid #3949ab;
  color: #fff;
  padding: 8px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-guardar-comentari:hover {
  background-color: #5c6bc0;
  transform: translateY(-2px);
}

/* Área de texto estilizada */
.textarea-comentari {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.textarea-comentari:focus {
  outline: none;
  border-color: #7986cb;
  background-color: #fff;
}

.dies-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  background-color: #fafafa;
}

.dia-item {
  cursor: pointer;
  border-radius: 15px;
  border: 2px solid #7986cb;
  background-color: #f8f9ff;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(121, 134, 203, 0.1);
}

.dia-item:hover {
  background-color: #e8eaf6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(121, 134, 203, 0.2);
  border-color: #3949ab;
}

.dia-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dia-data {
  font-size: 1.1rem;
  font-weight: bold;
  color: #3949ab;
  text-transform: capitalize;
}

.dia-horari {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}
</style>
