<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Configuració de Criteris</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="intro-text">
          <p>Ajusta els pesos dels criteris per modular com es prioritzen les sol·licituds de tallers. Els valors més alts augmenten la prioritat, mentre que els negatius la disminueixen.</p>
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
              <input
                v-model.number="editedWeights[weight.id]"
                type="number"
                min="-100"
                max="100"
                class="input-pes"
              />
            </div>
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
          Restablir Valors
        </button>
        <button class="btn-guardar" @click="guardarCambios" :disabled="loading">
          Guardar Canvis
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCriterisWeights, updateCriterisWeight } from "@/services/communicationManagerDatabase.js";

const emit = defineEmits(["close"]);

const weights = ref([]);
const editedWeights = ref({});
const loading = ref(true);
const error = ref("");
const successMessage = ref("");

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
    // Filtrar solo los criterios que queremos mostrar
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

const closeModal = () => {
  emit("close");
};

onMounted(cargarWeights);
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
</style>
