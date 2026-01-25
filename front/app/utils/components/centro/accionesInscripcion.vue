<script setup>
import { ref, watch } from "vue";
import Swal from "sweetalert2";
import {
  updateInscripcion,
  deleteInscripcion,
  afegirPersonalAssistencia,
  getAssistenciesByTallerId,
} from "@/services/communicationManagerDatabase";

const props = defineProps({
  tallerId: { type: Number, required: true },
  inscripcion: { type: Object, default: null },
});

const emit = defineEmits(["refresh", "active"]);

// --- ESTADOS ---
const showInscriptionModal = ref(false);

// --- WATCHERS ---
// Vigilamos si algún modal se abre para avisar al padre y que suba el z-index de la fila
watch(showInscriptionModal, (isOpen) => {
  emit("active", isOpen);
});

const formInscription = ref({
  id: null,
  institucioId: null,
  tallerID: null,
  alumnesAfegir: [""],
  profesAfegir: [""],
  autoritzat: true,
});

// --- FUNCIONES ---
const openInscriptionModal = async () => {
  if (props.inscripcion) {
    try {
      // Obtener las assistencias del taller
      const assistencias = await getAssistenciesByTallerId(props.tallerId);
      const miInstitucionId = Number.parseInt(localStorage.getItem("user_institution_id"));

      let alumnesExistentes = [];
      let profesoresExistentes = [];

      // Extraer alumnos y profesores de las assistencias
      if (assistencias && assistencias.length > 0) {
        for (const assistencia of assistencias) {
          // Parsear los JSONs de alumnos
          const llista_alumnes = assistencia.llista_alumnes
            ? JSON.parse(assistencia.llista_alumnes)
            : [];
          // Parsear los JSONs de profesores
          const llista_professors = assistencia.llista_professors
            ? JSON.parse(assistencia.llista_professors)
            : [];

          // Extraer nombres de alumnos que pertenecen a mi institución (evitar duplicados)
          llista_alumnes.forEach((alumne) => {
            if (
              alumne.NOM &&
              alumne.INSTITUT === miInstitucionId &&
              !alumnesExistentes.includes(alumne.NOM)
            ) {
              alumnesExistentes.push(alumne.NOM);
            }
          });

          // Extraer nombres de profesores que pertenecen a mi institución (evitar duplicados)
          llista_professors.forEach((profe) => {
            if (
              profe.NOM &&
              profe.INSTITUT === miInstitucionId &&
              !profesoresExistentes.includes(profe.NOM)
            ) {
              profesoresExistentes.push(profe.NOM);
            }
          });
        }
      }

      // Pre-completar el formulario con los datos existentes
      formInscription.value = {
        id: props.inscripcion.id,
        institucioId: miInstitucionId,
        tallerID: props.tallerId,
        alumnesAfegir: alumnesExistentes.length > 0 ? alumnesExistentes : [""],
        profesAfegir: profesoresExistentes.length > 0 ? profesoresExistentes : [""],
        autoritzat: true,
      };
      showInscriptionModal.value = true;
    } catch (error) {
      console.error("Error al cargar datos de assistencia:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al carregar les dades d'assistència.",
      });
    }
  }
};

const handleInscriptionUpdate = async () => {
  try {
    // Filtrar nombres vacíos de los arrays
    const alumnesLimpios = formInscription.value.alumnesAfegir.filter(
      (alumne) => alumne && alumne.trim() !== "",
    );
    const profesLimpios = formInscription.value.profesAfegir.filter(
      (profe) => profe && profe.trim() !== "",
    );

    // Enviar solo los datos que necesita el endpoint
    const dataToSend = {
      institucioId: formInscription.value.institucioId,
      tallerID: formInscription.value.tallerID,
      alumnesAfegir: alumnesLimpios,
      profesAfegir: profesLimpios,
    };
    
    await afegirPersonalAssistencia(dataToSend);
    showInscriptionModal.value = false;
    emit("refresh");
    Swal.fire({
      icon: "success",
      title: "Actualitzat",
      text: "Assistència actualitzada correctament.",
    });
  } catch (error) {
    console.error("Error en handleInscriptionUpdate:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al actualitzar la assistència.",
    });
  }
};



// Funciones per al form d'edició (Update)
const addAlumneInscription = () => formInscription.value.alumnesAfegir.push("");
const removeAlumneInscription = (i) =>
  formInscription.value.alumnesAfegir.splice(i, 1);
const addProfeInscription = () => formInscription.value.profesAfegir.push("");
const removeProfeInscription = (i) => formInscription.value.profesAfegir.splice(i, 1);



const handleDelete = async () => {
  if (!props.inscripcion || !confirm("Segur que vols eliminar?")) return;
  try {
    await deleteInscripcion(props.inscripcion.id);
    emit("refresh");
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al eliminar la inscripció.",
    });
  }
};
</script>

<template>
  <div class="acciones-wrapper">
    <!-- Botones principales -->
    <button @click="openInscriptionModal" id="btn-update">Alumnes i Profesors</button>
    <button @click="handleDelete" id="btn-delete">Eliminar</button>

    <!-- Modal Inscription -->
    <div v-if="showInscriptionModal" class="modal-overlay" @click.self="showInscriptionModal = false">
      <div class="modal-content">
        <h2>Llista d'assistents</h2>
        <form @submit.prevent="handleInscriptionUpdate">
          <div class="form-section">
            <h3>Alumnes</h3>
            <div v-for="(n, i) in formInscription.alumnesAfegir" :key="i" class="input-dynamic">
              <input v-model="formInscription.alumnesAfegir[i]" placeholder="Nom alumne" />
              <button type="button" @click="removeAlumneInscription(i)" v-if="formInscription.alumnesAfegir.length > 1"
                class="btn-remove">
                ×
              </button>
            </div>
            <button type="button" @click="addAlumneInscription" class="btn-add">
              + Alumne
            </button>
          </div>
          <hr />
          <div class="form-section">
            <h3>Professors</h3>
            <div v-for="(n, i) in formInscription.profesAfegir" :key="i" class="input-dynamic">
              <input v-model="formInscription.profesAfegir[i]" placeholder="Nom profe" />
              <button type="button" @click="removeProfeInscription(i)" v-if="formInscription.profesAfegir.length > 1"
                class="btn-remove">
                ×
              </button>
            </div>
            <button type="button" @click="addProfeInscription" class="btn-add">
              + Professor
            </button>
          </div>
          <div class="modal-buttons">
            <button type="button" @click="showInscriptionModal = false" class="btn-cancel">
              Cancel·lar
            </button>
            <button type="submit" class="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>


  </div>
</template>

<style scoped>
.acciones-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-left: 20%;
}

#btn-update,
#btn-delete {
  background-color: #9facfe;
  color: #141414;
  border: 4px solid #717ed3;
  border-radius: 20px;
  padding: 5px 10px;
  cursor: pointer;
  font-family: "Coolvetica";
  transition: 0.3s;
  width: 140px;
  text-align: center;
}

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
  background: #959dd1;
  border-color: #717ed3;
  padding: 10px 20px;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-save {
  background: #3949ab;
  border-color: #323c7c;
  color: white;
  padding: 10px 20px;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-cancel:hover,
.btn-save:hover {
  background-color: #687dff;
  border-color: #4956aa;
}

.input-dynamic {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;

}

.input-dynamic input {
  flex: 1;
  border-radius: 30px;
  padding: 10px;
}

.btn-remove {
  background: #5762aa;
  color: white;
  border: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}

.btn-add {
  background: #5762aa;
  border-color: #3949ab;
  color: white;
  padding: 8px 15px;
  border-style: solid;
  border-width: 2px;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 5px;
  transition: 0.3s;
}

.btn-add:hover {
  background-color: #3949ab;
}
</style>
