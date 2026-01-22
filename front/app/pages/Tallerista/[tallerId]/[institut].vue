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

//ejemplo para ver esta pagina: http://localhost:3000/Tallerista/1/2
//teneis que tener datos que corresponden a esos ids en la base de datos
//tanto en assistencias como en tallers etc
const route = useRoute();

// Obtener IDs de la URL
const TALLER_ID = parseInt(route.params.tallerId) || 1;
const INSTITUT_USUARIO = parseInt(route.params.institut) || 1;

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
      if (alumne.INSTITUT === INSTITUT_USUARIO) {
        const nouAlumne = {};
        for (const key in alumne) {
          nouAlumne[key] = alumne[key];
        }
        if (instMap.value[alumne.INSTITUT]) {
          nouAlumne.INSTITUT = instMap.value[alumne.INSTITUT];
        }
        alumnesFiltrats.push(nouAlumne);
      }
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
      if (prof.INSTITUT === INSTITUT_USUARIO) {
        const nouProf = {};
        for (const key in prof) {
          nouProf[key] = prof[key];
        }
        if (instMap.value[prof.INSTITUT]) {
          nouProf.INSTITUT = instMap.value[prof.INSTITUT];
        }
        profesFiltrats.push(nouProf);
      }
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
    // Preparar arrays sense ID i convertir el nom de institució back a ID
    const alumnesParaGuardar = alumnesDelDia.value.map(a => ({
      NOM: a.NOM,
      INSTITUT: typeof a.INSTITUT === 'string' ? INSTITUT_USUARIO : a.INSTITUT,
      ASSISTENCIA: a.ASSISTENCIA,
      JUSTIFICAT: a.JUSTIFICAT
    }));
    
    const profsParaGuardar = professorsDelDia.value.map(p => ({
      NOM: p.NOM,
      INSTITUT: typeof p.INSTITUT === 'string' ? INSTITUT_USUARIO : p.INSTITUT,
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
  <Encabezado></Encabezado>
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
          <div
            v-for="assistencia in assistencies"
            :key="assistencia.id"
            class="dia-item"
            @click="obrirModal(assistencia)"
          >
            <div class="dia-info">
              <span class="dia-data">{{ formatDia(assistencia.dia) }}</span>
              <span class="dia-horari">{{ getInfoTorn(assistencia.dia) }}</span>
            </div>
            <span class="dia-arrow">→</span>
          </div>
        </div>

        <!-- Bloc de comentaris -->
        <div class="comentaris-section">
          <h3>Comentari sobre la sessió</h3>
          <textarea
            v-model="comentari"
            placeholder="Afegeix comentaris sobre el taller (màxim 300 caràcters)"
            maxlength="300"
            class="textarea-comentari"
          ></textarea>
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
                  <input
                    type="checkbox"
                    :checked="alumne.ASSISTENCIA"
                    @change="toggleAssistenciaAlumne(index)"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    :checked="alumne.JUSTIFICAT"
                    :disabled="alumne.ASSISTENCIA"
                    @change="toggleJustificatAlumne(index)"
                  />
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
                  <input
                    type="checkbox"
                    :checked="profe.ASSISTENCIA"
                    @change="toggleAssistenciaProfe(index)"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    :checked="profe.JUSTIFICAT"
                    :disabled="profe.ASSISTENCIA"
                    @change="toggleJustificatProfe(index)"
                  />
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
}

#contenido {
  margin-top: 20px;
  margin-left: 50px;
  margin-right: 50px;
  font-family: "Coolvetica";
  font-weight: lighter;
  flex: 1;
}

.header h2 {
  font-size: 1.8rem;
  font-weight: lighter;
  color: #333;
  margin-bottom: 30px;
  margin-top: 0;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 1rem;
}

.error {
  color: #d32f2f;
}

.llista-dies h3 {
  font-size: 1.2rem;
  font-weight: lighter;
  margin-bottom: 20px;
  color: #666;
}

.no-dies {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 0.95rem;
}

.dies-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
}

.dia-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dia-item:hover {
  background-color: #f0f0f0;
  border-color: #999;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.dia-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dia-data {
  font-size: 0.95rem;
  color: #333;
  text-transform: capitalize;
  font-weight: normal;
}

.dia-horari {
  font-size: 0.85rem;
  color: #888;
}

.dia-arrow {
  font-size: 1rem;
  color: #999;
}

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
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 650px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: normal;
  margin: 0;
  color: #333;
}

.btn-tancar {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-tancar:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.taula-section {
  margin-bottom: 28px;
}

.taula-section:last-child {
  margin-bottom: 0;
}

.taula-section h4 {
  font-size: 0.95rem;
  font-weight: normal;
  margin: 0 0 12px 0;
  color: #555;
}

.comentaris-section {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comentaris-section h4 {
  font-size: 0.95rem;
  font-weight: normal;
  margin: 0 0 12px 0;
  color: #555;
}

.textarea-comentari {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
}

.textarea-comentari:focus {
  outline: none;
  border-color: #5C6BC0;
  box-shadow: 0 0 4px rgba(92, 107, 192, 0.2);
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f9f9f9;
  font-weight: normal;
  color: #666;
  font-size: 0.85rem;
}

tbody tr:hover {
  background-color: #fafafa;
}

.input-nom {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.input-nom:focus {
  outline: none;
  border-color: #5C6BC0;
  box-shadow: 0 0 4px rgba(92, 107, 192, 0.2);
}

td input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #5C6BC0;
}

td input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.no-dades {
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.btn-cancelar,
.btn-guardar {
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-family: "Coolvetica";
  font-size: 0.9rem;
  font-weight: normal;
  transition: all 0.2s ease;
}

.btn-cancelar {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
}

.btn-cancelar:hover {
  background-color: #efefef;
  border-color: #999;
}

.btn-guardar {
  background-color: #5C6BC0;
  border: none;
  color: #fff;
}

.btn-guardar:hover {
  background-color: #4d58a6;
}

.btn-guardar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Bloc de comentaris */
.comentaris-section {
  margin-top: 24px;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.comentaris-section h3 {
  font-size: 0.95rem;
  margin: 0 0 12px 0;
  color: #555;
  font-weight: normal;
}

.comentari-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: flex-end;
}

.btn-guardar-comentari,
.btn-tancar-comentari {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: "Coolvetica";
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-guardar-comentari {
  background-color: #5C6BC0;
  color: white;
}

.btn-guardar-comentari:hover {
  background-color: #4d58a6;
}

.btn-tancar-comentari {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
}

.btn-tancar-comentari:hover {
  background-color: #efefef;
}
</style>
