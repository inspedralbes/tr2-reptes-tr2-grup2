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
      continue;
    }

    if (fechaTaller && fechaTaller < hoy) {
      resultado.push(taller);
    }
  }

  return resultado;
}

onMounted(async () => {
  // DATOS ESTÁTICOS DE PRUEBA (TEMPORAL)
  tallersFinalitzats.value = [
    {
      id: 1,
      nom: "Taller de Cocina Mediterránea (Demo)",
      descripcio: "Un taller demostrativo sobre cocina tradicional.",
      direccio: "Aula Gastronómica 1",
    },
    {
      id: 2,
      nom: "Introducción a Vue.js (Demo)",
      descripcio: "Aprende los fundamentos del framework progresivo.",
      direccio: "Lab de Informática 2",
    },
    {
      id: 3,
      nom: "Mecánica Básica (Demo)",
      descripcio: "Mantenimiento preventivo para tu vehículo.",
      direccio: "Taller de Automoción",
    },
  ];
  isLoading.value = false;

  /* 
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
  */
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
          <p class="ubicacion">{{ taller.direccio }}</p>
          <NuxtLink :to="`/centro/paginaReviewTaller-Profes/${taller.id}`">
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
button {
  background-color: #5c6bc0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
