<template>
  <div class="solicitats-assignats-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregant dades...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="totalInscripcions === 0" class="no-data">
      <span>📭</span>
      <p>No hi ha inscripcions disponibles</p>
    </div>

    <div v-else class="chart-wrapper">
      <div class="chart-content">
        <v-chart class="pie-chart" :option="chartOption" autoresize />
        <div class="legend-custom">
          <div class="legend-item">
            <span class="legend-dot" style="background: #3949ab"></span>
            <span>Assignades ({{ percentatgeAssignades }}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #9fa8da"></span>
            <span>Pendents ({{ percentatgePendents }}%)</span>
          </div>
        </div>
      </div>

      <div class="stats-cards">
        <div class="stat-card total">
          <span class="stat-number">{{ totalInscripcions }}</span>
          <span class="stat-label">Total Sol·licituds</span>
        </div>
        <div class="stat-card assignades">
          <span class="stat-number">{{ inscripcionsAssignades }}</span>
          <span class="stat-label">Assignades</span>
        </div>
        <div class="stat-card pendents">
          <span class="stat-number">{{ inscripcionsPendents }}</span>
          <span class="stat-label">Pendents</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { getAllInscripcions } from "@/services/communicationManagerDatabase.js";

// Registrar componentes de ECharts
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const inscripcions = ref([]);
const loading = ref(true);
const error = ref("");

// Computed properties para calcular estadísticas
const totalInscripcions = computed(() => {
  return inscripcions.value.length;
});

const inscripcionsAssignades = computed(() => {
  let contador = 0;
  for (let i = 0; i < inscripcions.value.length; i++) {
    try {
      const alumnes = JSON.parse(inscripcions.value[i].alumnes || "[]");
      // Contar inscripciones que tienen al menos un alumno con estado "ACCEPTAT"
      let tieneAceptado = false;
      for (let j = 0; j < alumnes.length; j++) {
        if (alumnes[j].ESTAT === "ACCEPTAT") {
          tieneAceptado = true;
          break;
        }
      }
      if (tieneAceptado) {
        contador++;
      }
    } catch (e) {
      // Si hay error al parsear, no contamos esta inscripción
    }
  }
  return contador;
});

const inscripcionsPendents = computed(() => {
  return totalInscripcions.value - inscripcionsAssignades.value;
});

const percentatgeAssignades = computed(() => {
  if (totalInscripcions.value === 0) return 0;
  return Math.round(
    (inscripcionsAssignades.value / totalInscripcions.value) * 100,
  );
});

const percentatgePendents = computed(() => {
  if (totalInscripcions.value === 0) return 0;
  return Math.round(
    (inscripcionsPendents.value / totalInscripcions.value) * 100,
  );
});

// Configuración del gráfico de queso
const chartOption = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#3949ab",
    borderWidth: 1,
    textStyle: {
      color: "#333",
      fontSize: 13,
    },
  },
  series: [
    {
      name: "Inscripcions",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: "#fff",
        borderWidth: 3,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: "bold",
          formatter: "{d}%",
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        {
          value: inscripcionsAssignades.value,
          name: "Assignades",
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#3949ab" },
                { offset: 1, color: "#5c6bc0" },
              ],
            },
          },
        },
        {
          value: inscripcionsPendents.value,
          name: "Pendents",
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#9fa8da" },
                { offset: 1, color: "#c5cae9" },
              ],
            },
          },
        },
      ],
    },
  ],
}));

const cargarDades = async () => {
  loading.value = true;
  error.value = "";
  try {
    inscripcions.value = await getAllInscripcions();
  } catch (err) {
    error.value = "Error al cargar inscripcions: " + err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cargarDades();
});
</script>

<style scoped>
.solicitats-assignats-container {
  padding: 0;
  background: transparent;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #666;
}

.spinner {
  width: 35px;
  height: 35px;
  border: 3px solid rgba(57, 73, 171, 0.2);
  border-top-color: #3949ab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error,
.no-data {
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.error span,
.no-data span {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}

.error p,
.no-data p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.chart-wrapper {
  border-radius: 8px;
  padding: 8px;
  box-shadow: none;
  display: flex;
  gap: 12px;
  align-items: center;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.stat-card {
  background: linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(57, 73, 171, 0.25);
  min-width: 85px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.assignades {
  background: linear-gradient(135deg, #3949ab 0%, #283593 100%);
}

.stat-card.pendents {
  background: linear-gradient(135deg, #9fa8da 0%, #7986cb 100%);
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.6rem;
  opacity: 0.95;
  margin-top: 2px;
  text-align: center;
}

.pie-chart {
  height: 160px;
  width: 100%;
}

.legend-custom {
  display: flex;
  gap: 10px;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  color: #555;
  font-weight: 500;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .chart-wrapper {
    padding: 15px;
  }

  .stats-cards {
    gap: 8px;
  }

  .stat-card {
    padding: 10px 15px;
    min-width: 90px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .pie-chart {
    height: 240px;
  }

  .legend-custom {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}

/* Animación de entrada */
.chart-wrapper {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
