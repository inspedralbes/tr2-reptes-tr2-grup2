<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import tallerSliders from "@/utils/components/centro/tallersSlider.vue";
import { ref, onMounted } from "vue";
import {
  getAllTallers,
  getAllInscripcions,
} from "@/services/communicationManagerDatabase";

const userName = ref("");
const tallers = ref([]);

const mesesNombres = [
  "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
];

const diasSemana = [
  "Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"
];

function processTallers(allTallers, allInscripcions) {
  // 1. Filtrar inscripciones por institución del usuario
  const usuarioInstitucionId = localStorage.getItem("user_institution_id");
  let misInscripciones = [];
  
  if (usuarioInstitucionId) {
    misInscripciones = allInscripcions.filter(
      (i) => i.institucio === parseInt(usuarioInstitucionId)
    );
  } else {
    // Si no hay ID de institución, quizás mostramos todo o nada. 
    // Asumiremos que si no hay ID, no filtramos (o mostramos todo 'active').
    misInscripciones = allInscripcions;
  }

  // Mapa de inscripciones activas (para filtrar tallers)
  // Asumimos que queremos ver los talleres que TIENEN una inscripción de este centro
  const talleresIds = new Set(misInscripciones.map(i => i.tallerId));

  const grouped = {};

  allTallers.forEach((t) => {
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
          mesIndex: dateObj.getMonth(), // Para ordenar si fuera necesario
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
    const [fetchedTallers, fetchedInscripcions] = await Promise.all([
      getAllTallers(),
      getAllInscripcions(),
    ]);
    
    tallers.value = processTallers(fetchedTallers, fetchedInscripcions);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

onMounted(() => {
  if (typeof window !== "undefined") {
    userName.value = localStorage.getItem("userName") || "";
  }
  fetchData();
});
</script>

<template>
  <Encabezado />
  <div id="cuerpo">
    <navProfes />
    <div id="contenido">
      <h2>
        Bon dia, <span id="user" >{{ userName }}</span
        >:
      </h2>
      <br />
      <h3>Tallers actius:</h3>
      <div id="slider">
        <tallerSliders :tallers="tallers" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "Coolvetica";
  src: url(/assets/fuentes/coolvetica/Coolvetica\ Rg.otf);
}
#cuerpo {
  display: flex;
  background-color: #f5f5f5;
  height: calc(100vh - 85px);
  overflow: hidden;
}

#contenido {
  margin-top: 30px;
  margin-left: 50px;
  font-family: "Coolvetica";
  background-color: #e0e0e0;
  border-radius: 20px;
  padding: 30px;
  width: 1050px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  height: 410px;
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
</style>
