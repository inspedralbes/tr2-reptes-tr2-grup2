<script setup>
import tallerSliders from "@/utils/components/centro/tallersSlider.vue";
import { ref, onMounted } from "vue";
import {
  getAllTallers,
  getAllInscripcions,
  getSystemSettings,
} from "@/services/communicationManagerDatabase";

const userName = ref("");
const tallers = ref([]);
const selectedPeriodeId = ref(null);

const mesesNombres = [
  "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
];

const diasSemana = [
  "Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"
];

function processTallers(allTallers, allInscripcions, periodeId) {
  // 1. Filtrar inscripciones por institución del usuario
  const usuarioInstitucionId = localStorage.getItem("user_institution_id");
  let misInscripciones = [];

  if (usuarioInstitucionId) {
    misInscripciones = allInscripcions.filter(
      (i) => i.institucio === parseInt(usuarioInstitucionId)
    );
  } else {
    misInscripciones = allInscripcions;
  }

  // Mapa de inscripciones activas (para filtrar tallers)
  const talleresIds = new Set();
  misInscripciones.forEach(i => {
    const alumnesArray = JSON.parse(i.alumnes || "[]");
    alumnesArray.forEach(alumne => {
      talleresIds.add(alumne.TALLER);
    });
  });

  const grouped = {};

  allTallers.forEach((t) => {
    // Filtrar por periodo seleccionado
    if (periodeId && t.periode !== periodeId) return;

    if (!talleresIds.has(t.id)) return;

    let horari = {};
    try {
      horari = typeof t.horari === "string" && t.horari.trim() !== ""
        ? JSON.parse(t.horari)
        : t.horari || {};
    } catch (e) {
      horari = {};
    }

    // Obtener fecha
    const parts = (horari.DATAINI || "").split("/");
    const year = parts[2] ? parseInt(parts[2], 10) : null;
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : null;
    const day = parts[0] ? parseInt(parts[0], 10) : null;

    if (year && month !== null && day) {
      const dateObj = new Date(year, month, day);
      const mesNombre = mesesNombres[dateObj.getMonth()];
      const diaNum = dateObj.getDate();
      const diaSemanaNombre = diasSemana[dateObj.getDay()];

      // Inicializar Mes
      if (!grouped[mesNombre]) {
        grouped[mesNombre] = {
          mes: mesNombre,
          mesIndex: dateObj.getMonth(),
          diasMap: {}
        };
      }

      // Inicializar Dia dentro del Mes
      if (!grouped[mesNombre].diasMap[diaNum]) {
        grouped[mesNombre].diasMap[diaNum] = {
          diaSemana: diaSemanaNombre,
          diaNum: diaNum,
          cursos: []
        };
      }

      // Añadir curso
      grouped[mesNombre].diasMap[diaNum].cursos.push({
        titulo: t.nom,
        lugar: t.direccio || "Ubicación desconocida",
        hora: horari.TORNS?.[0]?.HORAINICI || "00:00"
      });
    }
  });

  // Transformar objeto agrupado a array array
  const result = Object.values(grouped).map(grupoMes => {
    return {
      mes: grupoMes.mes,
      dias: Object.values(grupoMes.diasMap).sort((a, b) => a.diaNum - b.diaNum)
    };
  });

  // Ordenar meses?? El array original no parecía tener orden estricto, 
  // pero podemos ordenar por índice de mes si queremos. 
  // Por ahora lo dejamos como el orden de aparición o iteración.

  return result;
}

async function fetchData() {
  try {
    const [fetchedTallers, fetchedInscripcions, settings] = await Promise.all([
      getAllTallers(),
      getAllInscripcions(),
      getSystemSettings(),
    ]);

    selectedPeriodeId.value = settings.selectedPeriodeId;
    tallers.value = processTallers(fetchedTallers, fetchedInscripcions, selectedPeriodeId.value);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

onMounted(() => {
  if (typeof window !== "undefined") {
    userName.value = localStorage.getItem("user_name") || "";
  }
  fetchData();
});
</script>

<template>
  <div class="page-container">
    <div id="cuerpo">
      <h2>
        Bon dia, <span id="user">{{ userName }}</span>:
      </h2>
      <div id="contenido">
        <br />
        <h3>Tallers actius:</h3>
        <div id="slider">
          <tallerSliders :tallers="tallers" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "Coolvetica";
  src: url(/assets/fuentes/coolvetica/Coolvetica\ Rg.otf);
}

.page-container {
  width: 100%;
  flex: 1;
}

#cuerpo {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 200px);
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  font-family: "Coolvetica";
}

#cuerpo h2 {
  margin-top: 4%;
  margin-left: 4%;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

#contenido {
  margin-top: 3%;
  margin-left: 4%;
  margin-right: auto;
  font-family: "Coolvetica";
  background-color: #FFFFFF;
  border-radius: 20px;
  border-style: solid;
  border-color: #87878748;
  border-width: 2px;
  padding: 30px;
  width: 95%;
  max-width: 1400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

#slider {
  width: 100%;
  flex-grow: 1;
}

#user {
  color: #5c6bc0;
  font-weight: bold;
}


/* Media Query para móviles */
@media (max-width: 768px) {
  #cuerpo {
    min-height: calc(100vh - 60px);
    align-items: center;
  }

  .welcome-header {
    width: 95%;
    margin-left: 0;
    margin-top: 20px;
    text-align: left;
  }

  /* ... rest of media query ... */

  #contenido {
    width: 95%;
    /* Mantenemos margen pequeño en móvil */
    padding: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
