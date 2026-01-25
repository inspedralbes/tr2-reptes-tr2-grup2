<script setup>
import { ref, onMounted } from "vue";
import {
  getAllTallers,
  getAllInscripcions,
} from "@/services/communicationManagerDatabase";

const tallersFinalitzats = ref([]);
const isLoading = ref(true);

function processTallers(allTallers, allInscripcions) {
  // 1. Obtener ID de institución
  const rawId = localStorage.getItem("user_institution_id");
  const myInstId = parseInt(rawId);

  if (!myInstId) {
    return [];
  }

  // 2. Obtener IDs de talleres de mi institución (Sustituye filter y map)
  const misTalleresIds = [];
  for (let i = 0; i < allInscripcions.length; i++) {
    const inscripcion = allInscripcions[i];
    if (inscripcion.institucio === myInstId) {
      misTalleresIds.push(inscripcion.tallerId);
    }
  }

  // 3. Filtrar talleres: Que sean míos Y que ya hayan pasado
  const resultado = [];
  const hoy = new Date();

  for (let j = 0; j < allTallers.length; j++) {
    const taller = allTallers[j];

    // A. ¿Es mío? (Sustituye .includes)
    let esMio = false;
    for (let k = 0; k < misTalleresIds.length; k++) {
      if (misTalleresIds[k] === taller.id) {
        esMio = true;
        break;
      }
    }

    // Si no es mío, pasamos al siguiente taller inmediatamente
    if (!esMio) {
      continue;
    }

    // B. ¿Ya pasó? (Lógica de fecha)
    let fechaTaller = null;
    try {
      let obj = taller.horari;
      if (typeof taller.horari === "string") {
        obj = JSON.parse(taller.horari);
      }

      const dataStr = obj.DATAINI || "";
      let year = null,
        month = null,
        day = null;

      if (dataStr.indexOf("/") !== -1) {
        const parts = dataStr.split("/");
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else if (dataStr.indexOf("-") !== -1) {
        const parts = dataStr.split("-");
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }

      if (year && month !== null && day) {
        fechaTaller = new Date(year, month, day);
      }
    } catch (e) {
      console.warn("DEBUG Finalizados: Error parsing dates for taller", taller.id);
      continue;
    }

    if (fechaTaller && fechaTaller < hoy) {
      resultado.push(taller);
    }
  }

  return resultado;
}

onMounted(async () => {
  // LÓGICA ORIGINAL COMENTADA TEMPORALMENTE
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
      <div v-for="taller in tallersFinalitzats" :key="taller.id" class="card-taller">
        <div class="card-header">
          <h4>{{ taller.nom }}</h4>
        </div>
        <div class="card-body">
          <p class="desc">{{ taller.descripcio }}</p>
          <p class="ubicacion">{{ taller.direccio }}</p>
          <NuxtLink :to="`/centro/reviewTallers/${taller.id}`">
            <button>Avaluar taller</button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lista-container {
  height: 100%;
  overflow-y: auto;
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
  margin-top: 2%;
  margin-left: 2%;
}

.card-taller {
  background: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-width: 320px;
}

.card-taller:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #5c6bc0, #3f51b5);
  color: white;
  padding: 20px;
}

.card-header h4 {
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-size: 1.25rem;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desc {
  font-weight: 600;
  color: #333;
  margin: 0;
}

.ubicacion {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

button {
  background-color: #5c6bc0;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  border: 4px solid #4453a5;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(92, 107, 192, 0.3);
  width: fit-content;
}

button:hover {
  background-color: #3f51b5;
  box-shadow: 0 6px 15px rgba(92, 107, 192, 0.4);
  border: 4px solid #2e3e96;
  transform: scale(1.02);
}
</style>