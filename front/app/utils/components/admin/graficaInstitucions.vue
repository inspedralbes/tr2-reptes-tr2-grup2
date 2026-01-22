<template>
  <div class="stats-container">
    <div v-if="loading" class="loading-state">
      <img
        src="/assets/gifs/loading.gif"
        alt="Carregant..."
        width="30"
        height="30"
      />
    </div>
    <div ref="chartRef" class="main-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
// Ajusta la ruta d'importació
import {
  getAllTallers,
  getAllInstitucions,
} from "@/services/communicationManagerDatabase";

const chartRef = ref(null);
const loading = ref(true);
let myChart = null;

const initChart = (years, seriesData) => {
  if (!chartRef.value) return;
  if (myChart) myChart.dispose();

  myChart = echarts.init(chartRef.value);

  const option = {
    title: {
      text: "Institucions amb Major Volum d'Alumnes",
      subtext: "Evolució per any d'inscripció",
      left: "center",
      textStyle: {
        fontSize: 17,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      bottom: "5%",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: years,
      name: "Any",
    },
    yAxis: {
      type: "value",
      name: "Total Alumnes",
    },
    series: seriesData.map((inst) => ({
      name: inst.name,
      type: "bar",
      emphasis: { focus: "series" },
      label: {
        show: true,
        position: "top",
      },
      data: inst.data,
    })),
  };

  myChart.setOption(option);
};

const fetchData = async () => {
  try {
    loading.value = true;
    // Demanem les dues coses en paral·lel
    const [tallers, institucions] = await Promise.all([
      getAllTallers(),
      getAllInstitucions(),
    ]);

    // 1. Obtenir tots els anys únics disponibles als tallers
    const uniqueYears = [...new Set(tallers.map((t) => t.curs))].sort();

    // 2. Construir la sèrie per a cada institució
    const series = institucions.map((inst) => {
      // Per a cada any, sumem les places dels tallers d'aquesta institució
      const dataPerYear = uniqueYears.map((year) => {
        // Filtrem tallers d'aquesta inst i aquest any
        const tallersDeInstEnAny = tallers.filter(
          (t) => t.institucio === inst.id && t.curs === year,
        );

        // Sumem les seves places
        const totalPlazas = tallersDeInstEnAny.reduce(
          (sum, t) => sum + (t.places_max || 0),
          0,
        );
        return totalPlazas;
      });

      return {
        name: inst.nom,
        data: dataPerYear,
      };
    });

    // Filtrar institucions que no tenen cap alumne en cap any (opcional, per netejar el gràfic)
    const activeSeries = series.filter((s) => s.data.some((val) => val > 0));

    initChart(uniqueYears, activeSeries);
  } catch (error) {
    console.error("Error obtenint dades institucions:", error);
  } finally {
    loading.value = false;
  }
};

const handleResize = () => myChart?.resize();

onMounted(() => {
  fetchData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  myChart?.dispose();
});
</script>

<style scoped>
.stats-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.loading-state {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #666;
}

.main-chart {
  width: 100%;
  max-width: 1000px;
  height: 230px;
}
</style>
