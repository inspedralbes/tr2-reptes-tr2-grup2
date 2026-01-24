<template>
  <Transition name="modal">
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
              <p>
                Ajusta els pesos dels criteris per modular com es prioritzen les
                sol·licituds de tallers. Els valors més alts augmenten la
                prioritat, mentre que els negatius la disminueixen.
              </p>
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
                  <input v-model.number="editedWeights[weight.id]" type="number" min="-100" max="100"
                    class="input-pes" />
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN: PERIODES -->
          <div class="section">
            <h3 class="section-title">Periode Actual</h3>
            <div class="intro-text">
              <p>
                Selecciona el periode que es mostrarà a totes les vistes. Només es
                veuran tallers i inscripcions d'aquest periode.
              </p>
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
  </Transition>
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
  procesarInscripcions,
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
    const newPeriode = await createPeriode(
      newPeriodeDataIni.value,
      newPeriodeDataFi.value
    );
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: "Coolvetica", Arial, sans-serif;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 20px;
  width: 90%;
  max-width: 950px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #FFFFFF;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #5c6bc0;
  border-radius: 10px;
}

.section {
  margin-bottom: 35px;
  padding: 25px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3949ab;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 3px solid #e8eaf6;
}

.intro-text {
  padding: 18px;
  margin-bottom: 25px;
  font-size: 0.92rem;
  color: #949494;
  line-height: 1.6;
  border-bottom: 2px solid #e8eaf6;
}

.intro-text p {
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1rem;
}

.weights-table {
  background-color: white;
  border-radius: 15px;
  overflow: hidden;

}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 0.8fr 0.9fr;
  border-radius: 50px;
  background: #7986CB;
  color: white;
  padding: 18px 20px;
  font-weight: 600;
  gap: 15px;
  font-size: 0.95rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 0.8fr 0.9fr;
  border-radius: 50px;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
  gap: 15px;
  transition: background-color 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.col-criterio {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
  border-right: 2px solid #e8eaf648;
}

.col-desc {
  font-size: 0.88rem;
  color: #ffffff;
  line-height: 1.4;
}

.col-pes {
  text-align: center;
}

.pes-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e8eaf6 0%, #f3f4f9 100%);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  color: #3949ab;
  border: 2px solid #e8eaf6;
}

.col-input {
  text-align: center;
}

.input-pes {
  width: 75px;
  padding: 10px;
  border: 2px solid #5c6bc0;
  border-radius: 30px;
  text-align: center;
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 600;
  color: #333;
  transition: all 0.3s ease;
}

.input-pes:focus {
  outline: none;
  border-color: #3949ab;
  box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.15);
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px 18px;
  border-radius: 12px;
  margin-top: 20px;
  border-left: 4px solid #c62828;
  font-weight: 500;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 15px 18px;
  border-radius: 12px;
  margin-top: 20px;
  border-left: 4px solid #2e7d32;
  font-weight: 500;
}

.modal-footer {
  padding: 25px 30px;
  background-color: #f8f9fa;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 2px solid #e8eaf6;
  border-radius: 0 0 20px 20px;
}

.btn-restablir,
.btn-guardar {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.btn-restablir {
  background-color: #d3d9fc;
  color: #333;
  border-color: #9da6d4;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
}

.btn-restablir:hover {
  background-color: #c3caf0;
  transform: translateY(-2px);
  border-color: #959fcf;
}

.btn-guardar {
  background-color: #808bd1;
  border-color: #5762aa;
  color: white;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: #97a0dd;
  border-color: #6a74b9;
}

.btn-guardar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.periode-selector {
  display: flex;
  gap: 12px;
  align-items: center;

  padding: 18px;
  border-radius: 12px;

}

.periode-dropdown {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #5c6bc0;
  border-radius: 40px;
  font-size: 0.95rem;
  font-family: inherit;
  background-color: white;
  transition: all 0.3s ease;
}

.periode-dropdown:focus {
  outline: none;
  border-color: #3949ab;
  box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.15);
}

.btn-guardar-periode {
  background-color: #808bd1;
  border-color: #5762aa;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
  cursor: pointer;
  margin-left: 40px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;


}

.btn-guardar-periode:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: #97a0dd;
  border-color: #6a74b9;
}

.btn-guardar-periode:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-periode {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  padding: 18px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 600;
  font-size: 0.92rem;
  color: #333;
}

.date-input {
  padding: 12px 15px;
  border: 2px solid #5c6bc0;
  border-radius: 40px;
  font-size: 0.95rem;
  font-family: inherit;
  min-width: 100px;
  background-color: white;
  transition: all 0.3s ease;
}

.date-input:focus {
  outline: none;
  border-color: #3949ab;
  box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.15);
}

.btn-crear-periode {
  padding: 12px 24px;
  background-color: #808bd1;
  border-color: #5762aa;
  color: white;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-crear-periode:hover {
  transform: translateY(-2px);
  background-color: #97a0dd;
  border-color: #6a74b9;
}

/* Transiciones del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
  opacity: 0;
}
</style>
