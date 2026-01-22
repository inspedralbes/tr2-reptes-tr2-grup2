<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Configuració</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- SECCIÓN: CRITERIS -->
        <div class="section">
          <h3 class="section-title">Pesos dels Criteris</h3>
          <div class="intro-text">
            <p>Ajusta els pesos dels criteris per modular com es prioritzen les sol·licituds de tallers. Els valors més
              alts augmenten la prioritat, mentre que els negatius la disminueixen.</p>
          </div>

          <div v-if="loading" class="loading">Carregant criteris...</div>

          <div v-else class="weights-table">
            <div class="table-header">
              <div class="col-criterio">Criterio</div>
              <div class="col-desc">Descripció</div>
              <div class="col-pes">Pes Actual</div>
              <div class="col-input">Nou Pes</div>
            </div>

            <div v-for="weight in weights" :key="weight.id" class="table-row">
              <div class="col-criterio">
                <strong>{{ getCriterioName(weight.criterio) }}</strong>
              </div>
              <div class="col-desc">
                {{ getCriterioDesc(weight.criterio) }}
              </div>
              <div class="col-pes">
                <span class="pes-badge">{{ weight.peso }}</span>
              </div>
              <div class="col-input">
                <input v-model.number="editedWeights[weight.id]" type="number" min="-100" max="100" class="input-pes" />
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN: PERIODES -->
        <div class="section">
          <h3 class="section-title">Periode Actual</h3>
          <div class="intro-text">
            <p>Selecciona el periode que es mostrarà a totes les vistes. Només es veuran tallers i inscripcions d'aquest
              periode.</p>
          </div>

          <div class="periode-selector">
            <select v-model="selectedPeriodeId" class="periode-dropdown">
              <option value="">-- Selecciona un periode --</option>
              <option v-for="p in periodes" :key="p.id" :value="p.id">
                {{ formatDate(p.dataIni) }} - {{ formatDate(p.dataFi) }}
              </option>
            </select>
            <button class="btn-guardar-periode" @click="guardarPeriode" :disabled="!selectedPeriodeId">
              Guardar
            </button>
          </div>
        </div>

        <!-- SECCIÓN: CREAR PÉRIODE -->
        <div class="section">
          <h3 class="section-title">Crear Période</h3>
          <div class="intro-text">
            <p>Afegeix un nou periode indicant les dates d'inici i final.</p>
          </div>

          <div class="create-periode">
            <div class="input-group">
              <label for="dataIni">Data d'Inici:</label>
              <input id="dataIni" v-model="newPeriodeDataIni" type="date" class="date-input" />
            </div>
            <div class="input-group">
              <label for="dataFi">Data Final:</label>
              <input id="dataFi" v-model="newPeriodeDataFi" type="date" class="date-input" />
            </div>
            <button class="btn-crear-periode" @click="crearPeriode">
              Crear Periode
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-restablir" @click="restablirValors">
          Restablir Pesos
        </button>
        <button class="btn-guardar" @click="guardarCambios" :disabled="loading">
          Guardar Criteris
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getCriterisWeights,
  updateCriterisWeight,
  getSystemSettings,
  updateSystemSettings,
  getPeriodes,
  createPeriode,
  procesarInscripcions
} from "@/services/communicationManagerDatabase.js";

const emit = defineEmits(["close"]);

// Criteris
const weights = ref([]);
const editedWeights = ref({});
const loading = ref(true);
const error = ref("");
const successMessage = ref("");

// Periodes
const periodes = ref([]);
const selectedPeriodeId = ref(null);
const systemSettingsId = ref(null);
const newPeriodeDataIni = ref("");
const newPeriodeDataFi = ref("");

const criterioTranslations = {
  FIRST_TIME: {
    name: "Primera Vegada",
    desc: "Bonus per a sol·licituds de centres que mai han participat",
  },
  ATTENDANCE_RISK: {
    name: "Risc d'Assistència",
    desc: "Penalty per a centres amb baix historial d'assistència",
  },
  NO_CAPACITY: {
    name: "Falta de Capacitat",
    desc: "Penalty quan no hi ha places disponibles al taller",
  },
};

const getCriterioName = (criterio) => {
  return criterioTranslations[criterio]?.name || criterio;
};

const getCriterioDesc = (criterio) => {
  return criterioTranslations[criterio]?.desc || "";
};

const cargarWeights = async () => {
  loading.value = true;
  error.value = "";
  try {
    const data = await getCriterisWeights();
    weights.value = data.filter(
      (w) => w.criterio !== "DIVERSITY" && w.criterio !== "NE"
    );
    editedWeights.value = {};
    weights.value.forEach((w) => {
      editedWeights.value[w.id] = w.peso;
    });
  } catch (err) {
    error.value = "Error al cargar criteris: " + err.message;
  } finally {
    loading.value = false;
  }
};

const cargarPeriodes = async () => {
  try {
    periodes.value = await getPeriodes();
  } catch (err) {
    error.value = "Error al cargar periodes: " + err.message;
  }
};

const cargarSystemSettings = async () => {
  try {
    const settings = await getSystemSettings();
    selectedPeriodeId.value = settings.selectedPeriodeId;
    systemSettingsId.value = settings.id;
  } catch (err) {
    error.value = "Error al cargar configuració: " + err.message;
  }
};

const restablirValors = () => {
  const valorsDefault = {
    FIRST_TIME: 20,
    ATTENDANCE_RISK: -30,
    NO_CAPACITY: -30,
  };

  weights.value.forEach((w) => {
    editedWeights.value[w.id] = valorsDefault[w.criterio] || w.peso;
  });
};

const guardarCambios = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const updates = weights.value
      .filter((w) => editedWeights.value[w.id] !== w.peso)
      .map((w) => updateCriterisWeight(w.id, editedWeights.value[w.id]));

    await Promise.all(updates);

    successMessage.value = "✓ Criteris actualitzats correctament";
    await cargarWeights();
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    error.value = "Error al guardar: " + err.message;
  } finally {
    loading.value = false;
  }
};

const guardarPeriode = async () => {
  if (!selectedPeriodeId.value) {
    error.value = "Selecciona un periode";
    return;
  }

  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    await updateSystemSettings(systemSettingsId.value, selectedPeriodeId.value);

    // Enviar el periode al backend para procesar inscripcions
    try {
      await procesarInscripcions(selectedPeriodeId.value);
    } catch (procError) {
      console.warn("Error al processar inscripcions:", procError);
      // No mostrar error al usuario, solo registrar en consola
    }

    successMessage.value = "✓ Periode actualitzat correctament";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    error.value = "Error al guardar periode: " + err.message;
  } finally {
    loading.value = false;
  }
};

const crearPeriode = async () => {
  if (!newPeriodeDataIni.value || !newPeriodeDataFi.value) {
    error.value = "Completa les dues dates";
    return;
  }

  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const newPeriode = await createPeriode(newPeriodeDataIni.value, newPeriodeDataFi.value);
    successMessage.value = "✓ Periode creat correctament";
    newPeriodeDataIni.value = "";
    newPeriodeDataFi.value = "";
    await cargarPeriodes();
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    error.value = "Error al crear periode: " + err.message;
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("close");
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ca-ES");
};

onMounted(async () => {
  await cargarWeights();
  await cargarPeriodes();
  await cargarSystemSettings();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: "Coolvetica";
}

.modal-content {
  background-color: #f5f5f5;
  border-radius: 15px;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #3949ab;
  color: white;
  border-radius: 15px 15px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 0.8;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3949ab;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.intro-text {
  background-color: #e8eaf6;
  border-left: 4px solid #3949ab;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.intro-text p {
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.weights-table {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 0.8fr 0.9fr;
  background-color: #3949ab;
  color: white;
  padding: 15px;
  font-weight: 600;
  gap: 10px;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 0.8fr 0.9fr;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.col-criterio {
  font-weight: 500;
  color: #283593;
}

.col-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.3;
}

.col-pes {
  text-align: center;
}

.pes-badge {
  display: inline-block;
  background-color: #e0e0e0;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: 500;
  color: #333;
}

.col-input {
  text-align: center;
}

.input-pes {
  width: 70px;
  padding: 8px;
  border: 1px solid #3949ab;
  border-radius: 5px;
  text-align: center;
  font-size: 0.95rem;
  font-family: inherit;
}

.input-pes:focus {
  outline: none;
  border-color: #283593;
  box-shadow: 0 0 5px rgba(57, 73, 171, 0.3);
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 5px;
  margin-top: 15px;
  border-left: 4px solid #c62828;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 5px;
  margin-top: 15px;
  border-left: 4px solid #2e7d32;
}

.modal-footer {
  padding: 20px;
  background-color: #fafafa;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid #ddd;
}

.btn-restablir,
.btn-guardar {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-restablir {
  background-color: #e0e0e0;
  color: #333;
}

.btn-restablir:hover {
  background-color: #bdbdbd;
}

.btn-guardar {
  background-color: #3949ab;
  color: white;
}

.btn-guardar:hover:not(:disabled) {
  background-color: #283593;
  box-shadow: 0 4px 10px rgba(57, 73, 171, 0.3);
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.periode-selector {
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.periode-dropdown {
  flex: 1;
  padding: 10px;
  border: 1px solid #3949ab;
  border-radius: 5px;
  font-size: 0.95rem;
  font-family: inherit;
}

.periode-dropdown:focus {
  outline: none;
  border-color: #283593;
  box-shadow: 0 0 5px rgba(57, 73, 171, 0.3);
}

.btn-guardar-periode {
  padding: 10px 20px;
  background-color: #3949ab;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-guardar-periode:hover:not(:disabled) {
  background-color: #283593;
  box-shadow: 0 4px 10px rgba(57, 73, 171, 0.3);
}

.btn-guardar-periode:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-periode {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.date-input {
  padding: 10px;
  border: 1px solid #3949ab;
  border-radius: 5px;
  font-size: 0.95rem;
  font-family: inherit;
  min-width: 150px;
}

.date-input:focus {
  outline: none;
  border-color: #283593;
  box-shadow: 0 0 5px rgba(57, 73, 171, 0.3);
}

.btn-crear-periode {
  padding: 10px 20px;
  background-color: #3949ab;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-crear-periode:hover {
  background-color: #283593;
  box-shadow: 0 4px 10px rgba(57, 73, 171, 0.3);
}
</style>
