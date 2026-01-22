<script setup>
import { ref, onMounted, computed } from "vue";
import { getAllAssistencies, getAllTallers } from "@/services/communicationManagerDatabase.js";

const assistencies = ref([]);
const tallers = ref([]);
const loading = ref(true);
const error = ref("");

// Calcular participación por taller
const participacioPerTaller = computed(() => {
  if (!assistencies.value.length || !tallers.value.length) return [];

  // Agrupar asistencias por taller
  const tallerStats = {};

  assistencies.value.forEach(assistencia => {
    const tallerId = assistencia.id_taller;

    if (!tallerStats[tallerId]) {
      tallerStats[tallerId] = {
        totalAlumnes: 0,
        alumnesAssistits: 0,
        sessions: 0
      };
    }

    try {
      const alumnes = JSON.parse(assistencia.llista_alumnes || "[]");
      const alumnesAssistits = alumnes.filter(a => a.ASSISTENCIA === true).length;

      tallerStats[tallerId].totalAlumnes += alumnes.length;
      tallerStats[tallerId].alumnesAssistits += alumnesAssistits;
      tallerStats[tallerId].sessions += 1;
    } catch (e) {
      console.error("Error parsing alumnes:", e);
    }
  });

  // Crear array con datos para el gráfico
  return tallers.value
    .map(taller => {
      const stats = tallerStats[taller.id];
      if (!stats || stats.totalAlumnes === 0) return null;

      const percentatge = Math.round((stats.alumnesAssistits / stats.totalAlumnes) * 100);

      return {
        id: taller.id,
        nom: taller.nom,
        percentatge,
        alumnesAssistits: stats.alumnesAssistits,
        totalAlumnes: stats.totalAlumnes,
        sessions: stats.sessions
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.percentatge - a.percentatge); // Ordenar de mayor a menor
});

const cargarDades = async () => {
  loading.value = true;
  error.value = "";
  try {
    [assistencies.value, tallers.value] = await Promise.all([
      getAllAssistencies(),
      getAllTallers()
    ]);
  } catch (err) {
    error.value = "Error al cargar dades: " + err.message;
  } finally {
    loading.value = false;
  }
};

// Función para obtener color según el porcentaje (paleta azul/índigo)
const getColor = (percentatge) => {
  if (percentatge >= 80) return "#3949ab"; // Índigo oscuro
  if (percentatge >= 60) return "#5c6bc0"; // Índigo medio
  if (percentatge >= 40) return "#7986cb"; // Índigo claro
  if (percentatge >= 20) return "#9fa8da"; // Azul lavanda
  return "#c5cae9"; // Azul muy claro
};

onMounted(() => {
  cargarDades();
});
</script>

<template>
  <div class="participacio-container">

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregant dades...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="participacioPerTaller.length === 0" class="no-data">
      <span>📭</span>
      <p>No hi ha dades de participació disponibles</p>
    </div>

    <div v-else class="chart-container">
      <div class="chart-stats">
        <div class="stat-card">
          <span class="stat-number">{{ participacioPerTaller.length }}</span>
          <span class="stat-label">Tallers</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">
            {{Math.round(participacioPerTaller.reduce((sum, t) => sum + t.percentatge, 0) /
              participacioPerTaller.length)}}%
          </span>
          <span class="stat-label">Mitjana</span>
        </div>
      </div>

      <div class="bars-container">
        <div v-for="taller in participacioPerTaller" :key="taller.id" class="bar-item">
          <div class="bar-info">
            <span class="taller-nom">{{ taller.nom }}</span>
            <span class="taller-stats">
              {{ taller.alumnesAssistits }} / {{ taller.totalAlumnes }} alumnes
              <span class="sessions">({{ taller.sessions }} sessions)</span>
            </span>
          </div>
          <div class="bar-wrapper">
            <div class="bar" :style="{
              width: taller.percentatge + '%',
              backgroundColor: getColor(taller.percentatge)
            }">
              <span class="bar-label">{{ taller.percentatge }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-color" style="background-color: #3949ab;"></span>
          <span>Excellent (≥80%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #5c6bc0;"></span>
          <span>Bé (60-79%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #7986cb;"></span>
          <span>Regular (40-59%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #9fa8da;"></span>
          <span>Baix (20-39%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #c5cae9;"></span>
          <span>Molt baix (&lt;20%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.participacio-container {
  padding: 0;
  background: transparent;
  min-height: auto;
  max-height: 100px;
  overflow-y: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Scrollbar personalizado para el contenedor principal */
.participacio-container::-webkit-scrollbar {
  width: 5px;
}

.participacio-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.participacio-container::-webkit-scrollbar-thumb {
  background: #3949ab;
  border-radius: 10px;
}

.participacio-container::-webkit-scrollbar-thumb:hover {
  background: #283593;
}

.header {
  text-align: center;
  color: #3949ab;
  margin-bottom: 12px;
}

.header h2 {
  font-size: 1rem;
  margin: 0 0 3px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 0.7rem;
  opacity: 0.7;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.spinner {
  width: 25px;
  height: 25px;
  border: 2px solid rgba(57, 73, 171, 0.2);
  border-top-color: #3949ab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error,
.no-data {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.error span,
.no-data span {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.error p,
.no-data p {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
}

.chart-container {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.chart-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}

.stat-card {
  background: linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 6px rgba(57, 73, 171, 0.3);
}

.stat-number {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.65rem;
  opacity: 0.9;
  margin-top: 2px;
}

.bars-container {
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 3px;
}

/* Scrollbar personalizado para las barras */
.bars-container::-webkit-scrollbar {
  width: 4px;
}

.bars-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.bars-container::-webkit-scrollbar-thumb {
  background: #3949ab;
  border-radius: 10px;
}

.bars-container::-webkit-scrollbar-thumb:hover {
  background: #283593;
}

.bar-item {
  margin-bottom: 10px;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.bar-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 3px;
  flex-wrap: wrap;
  gap: 5px;
}

.taller-nom {
  font-weight: 600;
  font-size: 0.75rem;
  color: #333;
}

.taller-stats {
  font-size: 0.65rem;
  color: #666;
}

.sessions {
  color: #999;
  font-size: 0.6rem;
  margin-left: 3px;
}

.bar-wrapper {
  background-color: #f0f0f0;
  border-radius: 6px;
  height: 22px;
  overflow: hidden;
  position: relative;
}

.bar {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 1s ease-out;
  position: relative;
  min-width: 40px;
}

.bar-label {
  color: white;
  font-weight: 700;
  font-size: 0.7rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .header h2 {
    font-size: 0.9rem;
  }

  .bar-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-card {
    padding: 6px 12px;
  }

  .stat-number {
    font-size: 1.1rem;
  }
}
</style>