<script setup>
import { ref, onMounted } from "vue";
import {
  getAllTallers,
  getAllInscripcions,
} from "@/services/communicationManagerDatabase";

const tallersFinalitzats = ref([]);
const isLoading = ref(true);

function processTallers(allTallers, allInscripcions) {
  // 1. Obtener ID de institucion
  const myInstId = parseInt(localStorage.getItem("user_institution_id"));
  if (!myInstId) return [];

  // 2. IDs de talleres de mi insti
  const misTalleresIds = allInscripcions
    .filter((i) => i.institucio === myInstId)
    .map((i) => i.tallerId);

  // 3. Filtrar talleres (Míos + Finalizados)
  return allTallers.filter((taller) => {
    // A. ¿Es mío?
    if (!misTalleresIds.includes(taller.id)) return false;

    // B. ¿Ya pasó?
    let fechaTaller = null;
    try {
      // Parsear JSON del horario
      const obj =
        typeof taller.horari === "string"
          ? JSON.parse(taller.horari)
          : taller.horari;

      const parts = (obj.DATAINI || "").split("/");
      const year = parts[2] ? parseInt(parts[2], 10) : null;
      const month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
      const day = parts[0] ? parseInt(parts[0], 10) : null;

      if (year && month !== null && day) {
        fechaTaller = new Date(year, month, day);
      }
    } catch (e) {
      return false;
    }

    // Si existe fechaTaller y es menor que hoy... true.
    return fechaTaller && fechaTaller < new Date();
  });
}

onMounted(async () => {
  try {
    const [fetchedTallers, fetchedInscripcions] = await Promise.all([
      getAllTallers(),
      getAllInscripcions(),
    ]);

    tallersFinalitzats.value = processTallers(
      fetchedTallers,
      fetchedInscripcions,
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="lista-container">
    <div v-if="isLoading" class="loading">Carregant tallers finalitzats...</div>

    <div v-else-if="tallersFinalitzats.length === 0" class="no-data">
      No hi ha tallers finalitzats actualment.
    </div>

    <div v-else class="grid-tallers">
      <div
        v-for="taller in tallersFinalitzats"
        :key="taller.id"
        class="card-taller"
      >
        <div class="card-header">
          <h4>{{ taller.nom }}</h4>
        </div>
        <div class="card-body">
          <p class="desc">{{ taller.descripcio }}</p>
          <p class="ubicacion">📍 {{ taller.direccio }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lista-container {
  height: 100%;
  overflow-y: auto; /* Scroll interno */
  padding-right: 10px;
}

.lista-container::-webkit-scrollbar {
  width: 6px;
}
.lista-container::-webkit-scrollbar-thumb {
  background: #878787;
  border-radius: 10px;
}

.grid-tallers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

.card-taller {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.card-taller:hover {
  transform: translateY(-5px);
}

.card-header {
  background-color: #5c6bc0;
  color: white;
  padding: 15px;
}

.card-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.card-body {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.desc {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 15px;
}

.ubicacion {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.loading,
.no-data {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>
