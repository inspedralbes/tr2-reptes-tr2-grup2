<script setup>
import { ref, watch } from "vue";
import {
  updateInscripcion,
  deleteInscripcion,
  afegirPersonalAssistencia,
} from "@/services/communicationManagerDatabase";

const props = defineProps({
  tallerId: { type: Number, required: true },
  inscripcion: { type: Object, default: null },
});

const emit = defineEmits(["refresh", "active"]);

// --- ESTADOS ---
const showEditModal = ref(false);
const showInscripcioModal = ref(false);

// --- WATCHERS ---
// Vigilamos si algún modal se abre para avisar al padre y que suba el z-index de la fila
watch([showEditModal, showInscripcioModal], ([edit, create]) => {
  emit("active", edit || create);
});

const formIscripcio = ref({
  id: null,
  institucioId: null,
  tallerID: null,
  alumnesAfegir: [""],
  profesAfegir: [""],
  autoritzat: true,
});
const formCrear = ref({
  institucioId: null,
  tallerID: null,
  alumnesAfegir: [""],
  profesAfegir: [""],
});

// --- FUNCIONES ---
const openEditModal = () => {
  if (props.inscripcion) {
    // Inicializamos con arrays vacíos si no existen, o mapeamos si es necesario.
    // Asumimos que queremos editar/añadir sobre lo existente o empezar de cero en el update segun requerimiento.
    // Aquí inicializamos para cumplir con la estructura del payload.
    formIscripcio.value = {
      id: props.inscripcion.id,
      institucioId: props.inscripcion.institucioId || null,
      tallerID: props.inscripcion.tallerID || props.tallerId,
      alumnesAfegir: props.inscripcion.alumnesAfegir || [""],
      profesAfegir: props.inscripcion.profesAfegir || [""],
      autoritzat: true,
    };
    showEditModal.value = true;
  }
};

const handleUpdate = async () => {
  try {
    await updateInscripcion(formIscripcio.value.id, formIscripcio.value);
    showEditModal.value = false;
    emit("refresh");
    alert("Actualitzat correctament");
  } catch (error) {
    alert("Error al actualizar");
  }
};

const openInscripcioModal = () => {
  const institucioId = localStorage.getItem("user_institution_id");
  formCrear.value = {
    institucioId: parseInt(institucioId),
    tallerID: props.tallerId,
    alumnesAfegir: [""],
    profesAfegir: [""],
  };
  showInscripcioModal.value = true;
};

const addAlumne = () => formCrear.value.alumnesAfegir.push("");
const removeAlumne = (i) => formCrear.value.alumnesAfegir.splice(i, 1);
const addProfe = () => formCrear.value.profesAfegir.push("");
const removeProfe = (i) => formCrear.value.profesAfegir.splice(i, 1);

// Funcions per al form d'edició (Update)
const addAlumneUpdate = () => formIscripcio.value.alumnesAfegir.push("");
const removeAlumneUpdate = (i) =>
  formIscripcio.value.alumnesAfegir.splice(i, 1);
const addProfeUpdate = () => formIscripcio.value.profesAfegir.push("");
const removeProfeUpdate = (i) => formIscripcio.value.profesAfegir.splice(i, 1);

const handleCreateInscripcio = async () => {
  try {
    console.log("Creant inscripció amb dades:", formCrear.value);
    await afegirPersonalAssistencia(formCrear.value);
    showInscripcioModal.value = false;
    emit("refresh");
    alert("Inscrit correctament!");
  } catch (error) {
    alert("Error al inscribir");
  }
};

const handleDelete = async () => {
  if (!props.inscripcion || !confirm("Segur que vols eliminar?")) return;
  try {
    await deleteInscripcion(props.inscripcion.id);
    emit("refresh");
  } catch (error) {
    alert("Error al eliminar");
  }
};
</script>

<template>
  <div class="acciones-wrapper">
    <!-- Botones principales -->
    <button @click="openInscripcioModal" id="btn-inscripcion">
      Inscripció
    </button>
    <button @click="openEditModal" id="btn-update">Actualitzar</button>
    <button @click="handleDelete" id="btn-delete">Eliminar</button>

    <!-- Modal Editar -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="showEditModal = false"
    >
      <div class="modal-content">
        <h2>Actualitzar inscripció</h2>
        <form @submit.prevent="handleUpdate">
          <div class="form-section">
            <h3>Alumnes</h3>
            <div
              v-for="(n, i) in formIscripcio.alumnesAfegir"
              :key="i"
              class="input-dynamic"
            >
              <input
                v-model="formIscripcio.alumnesAfegir[i]"
                placeholder="Nom alumne"
              />
              <button
                type="button"
                @click="removeAlumneUpdate(i)"
                v-if="formIscripcio.alumnesAfegir.length > 1"
                class="btn-remove"
              >
                ×
              </button>
            </div>
            <button type="button" @click="addAlumneUpdate" class="btn-add">
              + Alumne
            </button>
          </div>
          <hr />
          <div class="form-section">
            <h3>Professors</h3>
            <div
              v-for="(n, i) in formIscripcio.profesAfegir"
              :key="i"
              class="input-dynamic"
            >
              <input
                v-model="formIscripcio.profesAfegir[i]"
                placeholder="Nom profe"
              />
              <button
                type="button"
                @click="removeProfeUpdate(i)"
                v-if="formIscripcio.profesAfegir.length > 1"
                class="btn-remove"
              >
                ×
              </button>
            </div>
            <button type="button" @click="addProfeUpdate" class="btn-add">
              + Professor
            </button>
          </div>
          <div class="modal-buttons">
            <button
              type="button"
              @click="showEditModal = false"
              class="btn-cancel"
            >
              Cancel·lar
            </button>
            <button type="submit" class="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Crear -->
    <div
      v-if="showInscripcioModal"
      class="modal-overlay"
      @click.self="showInscripcioModal = false"
    >
      <div class="modal-content modal-large">
        <h2>Nova Inscripció</h2>
        <form @submit.prevent="handleCreateInscripcio">
          <div class="form-section">
            <h3>Alumnes</h3>
            <div
              v-for="(n, i) in formCrear.alumnesAfegir"
              :key="i"
              class="input-dynamic"
            >
              <input
                v-model="formCrear.alumnesAfegir[i]"
                placeholder="Nom alumne"
              />
              <button
                type="button"
                @click="removeAlumne(i)"
                v-if="formCrear.alumnesAfegir.length > 1"
                class="btn-remove"
              >
                ×
              </button>
            </div>
            <button type="button" @click="addAlumne" class="btn-add">
              + Alumne
            </button>
          </div>
          <hr />
          <div class="form-section">
            <h3>Professors</h3>
            <div
              v-for="(n, i) in formCrear.profesAfegir"
              :key="i"
              class="input-dynamic"
            >
              <input
                v-model="formCrear.profesAfegir[i]"
                placeholder="Nom profe"
              />
              <button
                type="button"
                @click="removeProfe(i)"
                v-if="formCrear.profesAfegir.length > 1"
                class="btn-remove"
              >
                ×
              </button>
            </div>
            <button type="button" @click="addProfe" class="btn-add">
              + Professor
            </button>
          </div>
          <div class="modal-buttons">
            <button
              type="button"
              @click="showInscripcioModal = false"
              class="btn-cancel"
            >
              Cancel·lar
            </button>
            <button type="submit" class="btn-save">Inscriure</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acciones-wrapper {
  display: flex;
  gap: 10px;
}

#btn-inscripcion,
#btn-update,
#btn-delete {
  background-color: #9facfe;
  color: #141414;
  border: 4px solid #717ed3;
  border-radius: 20px;
  padding: 5px 15px;
  cursor: pointer;
  font-family: "Coolvetica";
  transition: 0.3s;
}

#btn-inscripcion:hover,
#btn-update:hover,
#btn-delete:hover {
  background-color: #687dff;
  border-color: #4956aa;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000 !important;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 400px;
  color: #1a1a1a;
}

.modal-large {
  width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.btn-cancel {
  background: #e0e0e0;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
}

.btn-save {
  background: #3949ab;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
}

.input-dynamic {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.input-dynamic input {
  flex: 1;
}

.btn-remove {
  background: #ff5252;
  color: white;
  border: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}

.btn-add {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 5px;
}
</style>
