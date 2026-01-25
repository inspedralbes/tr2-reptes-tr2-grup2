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
  const usuarioInstitucionId = localStorage.getItem("user_institution_id");
  const misInscripciones = [];
  const instId = (usuarioInstitucionId && usuarioInstitucionId.trim() !== "") ? parseInt(usuarioInstitucionId) : NaN;

  for (let i = 0; i < allInscripcions.length; i++) {
    const ins = allInscripcions[i];
    const matchesInst = isNaN(instId) || ins.institucio === instId;
    const isApproved = (ins.estat == 1 || ins.estat === true || ins.autoritzat == 1 || ins.autoritzat === true);
    if (matchesInst && isApproved) {
      misInscripciones.push(ins);
    }
  }

  const talleresIds = new Set();
  for (let i = 0; i < misInscripciones.length; i++) {
    let alumnesArray = [];
    try {
      const ins = misInscripciones[i];
      alumnesArray = typeof ins.alumnes === "string" ? JSON.parse(ins.alumnes || "[]") : ins.alumnes || [];
    } catch (e) {
      alumnesArray = [];
    }
    for (let j = 0; j < alumnesArray.length; j++) {
      const tallerEntry = alumnesArray[j];
      if (tallerEntry.ESTAT === "APROBADA") {
        talleresIds.add(tallerEntry.TALLER);
      }
    }
  }

  const grouped = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < allTallers.length; i++) {
    const t = allTallers[i];
    if (!talleresIds.has(t.id)) {
      continue;
    }

    let horari = {};
    try {
      horari = typeof t.horari === "string" && t.horari.trim() !== "" ? JSON.parse(t.horari) : t.horari || {};
    } catch (e) {
      horari = {};
    }

    // --- PARSEO DE FECHAS ROBUSTO ---
    function parseDate(dataStr) {
      if (!dataStr) return { day: null, month: null, year: null };
      let d = null, m = null, y = null;
      if (dataStr.indexOf("/") !== -1) {
        const p = dataStr.split("/");
        d = parseInt(p[0], 10);
        m = parseInt(p[1], 10) - 1;
        y = parseInt(p[2], 10);
      } else if (dataStr.indexOf("-") !== -1) {
        const p = dataStr.split("-");
        // Asumimos YYYY-MM-DD
        y = parseInt(p[0], 10);
        m = parseInt(p[1], 10) - 1;
        d = parseInt(p[2], 10);
      }
      return { day: d, month: m, year: y };
    }

    const { day: dayFi, month: monthFi, year: yearFi } = parseDate(horari.DATAFI);
    let isFinalizado = false;
    if (yearFi && monthFi !== null && dayFi) {
      const dateFi = new Date(yearFi, monthFi, dayFi);
      if (dateFi < today) isFinalizado = true;
    }

    const { day: dayIni, month: monthIni, year: yearIni } = parseDate(horari.DATAINI);

    if (yearIni && monthIni !== null && dayIni && !isNaN(yearIni)) {
      const dateObj = new Date(yearIni, monthIni, dayIni);
      const mesNombre = mesesNombres[dateObj.getMonth()];
      const diaNum = dateObj.getDate();
      const diaSemanaNombre = diasSemana[dateObj.getDay()];

      if (!grouped[mesNombre]) {
        grouped[mesNombre] = { mes: mesNombre, mesIndex: dateObj.getMonth(), diasMap: {} };
      }
      if (!grouped[mesNombre].diasMap[diaNum]) {
        grouped[mesNombre].diasMap[diaNum] = { diaSemana: diaSemanaNombre, diaNum: diaNum, cursos: [] };
      }
      grouped[mesNombre].diasMap[diaNum].cursos.push({
        titulo: t.nom,
        lugar: t.direccio || "Ubicación desconocida",
        hora: horari.TORNS?.[0]?.HORAINICI || "00:00",
        isFinalizado: isFinalizado
      });
    } else {
      console.warn(`DEBUG: Workshop ID ${t.id} ignored because it has invalid or missing DATAINI:`, horari.DATAINI);
    }
  }

  const result = [];
  const mesKeys = Object.keys(grouped);
  for (let i = 0; i < mesKeys.length; i++) {
    const grupoMes = grouped[mesKeys[i]];
    const dias = [];
    const diaKeys = Object.keys(grupoMes.diasMap);
    for (let j = 0; j < diaKeys.length; j++) {
      dias.push(grupoMes.diasMap[diaKeys[j]]);
    }
    // Ordenar burbuja
    for (let j = 0; j < dias.length - 1; j++) {
      for (let k = 0; k < dias.length - 1 - j; k++) {
        if (dias[k].diaNum > dias[k + 1].diaNum) {
          const temp = dias[k];
          dias[k] = dias[k + 1];
          dias[k + 1] = temp;
        }
      }
    }
    result.push({ mes: grupoMes.mes, dias: dias });
  }
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
