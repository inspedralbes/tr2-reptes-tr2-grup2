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
// Assegura't que la ruta d'importació sigui correcta segons la teva estructura de carpetes
import { getAllTallers } from "@/services/communicationManagerDatabase";

const chartRef = ref(null);
const loading = ref(true);
let myChart = null;

const initChart = (processedData) => {
  if (!chartRef.value) return;

  // Si ja existeix una instància, la netegem (útil si recarreguem dades)
  if (myChart) myChart.dispose();

  myChart = echarts.init(chartRef.value);

  const years = Object.keys(processedData).sort();

  const option = {
    title: {
      text: "Top 3 Tallers per Any",
      left: "center",
      top: 10,
    },
    legend: {
      data: years,
      bottom: 10,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      // Etiquetes fixes per a la posició 1, 2 i 3
      data: ["1r Més demanat", "2n Més demanat", "3r Més demanat"],
    },
    yAxis: {
      type: "value",
      name: "Alumnes (Places)",
    },
    series: years.map((year) => ({
      name: year,
      type: "bar",
      barGap: "10%",
      label: {
        show: true,
        position: "top",
        formatter: (params) => {
          // Evitem error si no hi ha dades per a aquesta posició (ex. any amb < 3 tallers)
          const item = processedData[year][params.dataIndex];
          return item ? item.name : "";
        },
        fontSize: 10,
      },
      // Mapegem els valors. Si hi ha menys de 3 tallers, omplim amb 0 o null
      data: processedData[year].map((d) => d.value),
    })),
  };

  myChart.setOption(option);
};

const fetchData = async () => {
  try {
    loading.value = true;
    const tallers = await getAllTallers();

    // 1. Agrupar tallers per any (camp 'curs')
    const groupedByYear = tallers.reduce((acc, taller) => {
      const year = taller.curs || "Sense any"; // Fallback per si de cas
      if (!acc[year]) acc[year] = [];

      acc[year].push({
        name: taller.nom,
        // Utilitzem places_max com a indicador d'"alumnes" segons el teu seed
        value: taller.places_max,
      });
      return acc;
    }, {});

    // 2. Ordenar per valor (desc) i agafar el TOP 3
    Object.keys(groupedByYear).forEach((year) => {
      groupedByYear[year].sort((a, b) => b.value - a.value);
      groupedByYear[year] = groupedByYear[year].slice(0, 3);
    });

    initChart(groupedByYear);
  } catch (error) {
    console.error("Error carregant gràfic de tallers:", error);
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
  height: 20%;
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
  height: 500px;
}
</style>
