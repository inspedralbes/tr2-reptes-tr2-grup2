<template>

  <div id="cuerpo">

    <div id="contenido">
      <div v-if="tallerNom" class="content-wrapper">
        <h2>{{ tallerNom }}</h2>
        <div class="comentari-section">
          <label for="comentari-textarea">Deixa aquí el teu comentari sobre el taller:</label>
          <textarea id="comentari-textarea" v-model="comentari" maxlength="300" placeholder="Escriu el teu comentari..."
            rows="6" class="textarea-style"></textarea>
          <div class="char-counter">{{ comentari.length }} / 300</div>
          <button @click="guardarComentari" class="btn-guardar">
            Enviar comentari
          </button>
          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>
        </div>
      </div>
      <div v-else class="loading">Carregant...</div>
    </div>
  </div>
</template>

<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getTallerById, saveComentariProfe } from "@/services/communicationManagerDatabase.js";

const route = useRoute();
const tallerNom = ref("");
const comentari = ref("");
const mensaje = ref("");
const mensajeTipo = ref("");
const idInstitucio = ref(null);

const loadTaller = async () => {
  try {
    const id = route.params.id;
    if (!id) return;

    const data = await getTallerById(id);
    tallerNom.value = data.nom || "Taller desconegut";
  } catch (err) {
    console.error("Error carregant taller:", err);
  }
};

const guardarComentari = async () => {
  try {
    if (!comentari.value.trim()) {
      mensaje.value = "Si us plau, escriu un comentari.";
      mensajeTipo.value = "error";
      return;
    }

    const tallerId = route.params.id;
    const institutId = localStorage.getItem("user_institution_id") || 1;

    await saveComentariProfe(tallerId, institutId, comentari.value);

    mensaje.value = "Comentari guardat correctament.";
    mensajeTipo.value = "success";
    comentari.value = "";
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    console.error("Error:", err);
    mensaje.value = "Error al guardar el comentari.";
    mensajeTipo.value = "error";
  }
};

onMounted(loadTaller);
</script>

<style scoped>
#cuerpo {
  display: flex;
  height: calc(100vh - 85px);
  overflow: hidden;
}

#contenido {
  margin-top: 40px;
  margin-left: 50px;
  font-family: "Coolvetica";
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 30px;
  width: 950px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 410px;
}

.content-wrapper h2 {
  margin: 0 0 20px 0;
  color: #283593;
  font-size: 1.8rem;
}

.comentari-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}

.textarea-style {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  height: 200px;
  resize: vertical;
}

.char-counter {
  font-size: 0.85rem;
  color: #666;
  text-align: right;
}

.btn-guardar {
  background-color: #808bd1;
  border-color: #5762aa;
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  border-style: solid;
  border-width: 4px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  align-self: flex-start;
}

.btn-guardar:hover {
  transform: translateY(-2px);
  background-color: #97a0dd;
  border-color: #6a74b9
}

.mensaje {
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 8px;
}

.mensaje.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.mensaje.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.loading {
  color: #666;
  text-align: center;
  padding: 40px;
}
</style>
