<template>
  <div class="stats-container">
    <div v-if="loading" class="loading-state">
      <img src="/assets/gifs/loading.gif" alt="Carregant..." width="30" height="30" />
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

  // Paleta de colores azules (de más oscuro a más claro)
  const blueColors = [
    '#1a237e', // Índigo oscuro
    '#283593', // Índigo
    '#3949ab', // Índigo medio
    '#5c6bc0', // Índigo claro
    '#7986cb', // Índigo muy claro
    '#9fa8da'  // Índigo pastel
  ];

  const option = {
    title: {
      text: 'Top 3 Tallers per Any',
      subtext: 'Tallers més demandats',
      left: 'center',
      padding: [5, 0, 10, 0], // Reducido el padding para controlar mejor con grid.top
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#333'
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666',
      }
    },
    legend: {
      data: years,
      bottom: 0, // Pegado abajo
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(57, 73, 171, 0.1)'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#5c6bc0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%', // Espacio suficiente para etiquetas X y Leyenda
      top: '80px', // Espacio fijo arriba para el título
      containLabel: true
    },
    xAxis: {
      type: 'category',
      // Etiquetes fixes per a la posició 1, 2 i 3
      data: ['1r Més demanat', '2n Més demanat', '3r Més demanat'],
      axisLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: 500
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: 'Alumnes (Places)',
      nameTextStyle: {
        color: '#666',
        fontSize: 11,
        fontWeight: 500
      },
      axisLabel: {
        color: '#999',
        fontSize: 10
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: (() => {
      const seriesArray = [];

      // Recorrer cada año
      for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
        const year = years[yearIndex];

        // Preparar los datos de este año
        const yearData = [];
        for (let i = 0; i < processedData[year].length; i++) {
          const d = processedData[year][i];
          yearData.push({
            value: d.value,
            itemStyle: {
              color: blueColors[yearIndex % blueColors.length],
              borderRadius: [6, 6, 0, 0],
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 8,
              shadowOffsetY: 3
            }
          });
        }

        // Agregar la serie completa
        seriesArray.push({
          name: year,
          type: 'bar',
          barGap: '20%',
          barMaxWidth: 100, // Aumentado para reducir espacio vacío entre barras
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              // Evitem error si no hi ha dades per a aquesta posició (ex. any amb < 3 tallers)
              const item = processedData[year][params.dataIndex];
              return item ? item.name : '';
            },
            fontSize: 10,
            fontWeight: 600,
            color: '#333'
          },
          data: yearData,
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetY: 5,
              shadowColor: 'rgba(57, 73, 171, 0.4)'
            }
          }
        });
      }

      return seriesArray;
    })()
  };

  myChart.setOption(option);
};

const fetchData = async () => {
  try {
    loading.value = true;
    const tallers = await getAllTallers();

    // 1. Agrupar tallers per any (camp 'curs')
    const groupedByYear = {};

    // Recorrer cada taller y agruparlo por año
    for (let i = 0; i < tallers.length; i++) {
      const taller = tallers[i];
      const year = taller.curs || "Sense any"; // Fallback per si de cas

      // Si este año no existe en el objeto, crear un array vacío
      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }

      // Agregar el taller a este año
      groupedByYear[year].push({
        name: taller.nom,
        // Utilitzem places_max com a indicador d'"alumnes" segons el teu seed
        value: taller.places_max,
      });
    }

    // 2. Ordenar per valor (desc) i agafar el TOP 3
    const years = Object.keys(groupedByYear);

    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      const tallersDelAny = groupedByYear[year];

      // Ordenar usando bubble sort (de mayor a menor)
      for (let j = 0; j < tallersDelAny.length - 1; j++) {
        for (let k = 0; k < tallersDelAny.length - j - 1; k++) {
          if (tallersDelAny[k].value < tallersDelAny[k + 1].value) {
            // Intercambiar
            const temp = tallersDelAny[k];
            tallersDelAny[k] = tallersDelAny[k + 1];
            tallersDelAny[k + 1] = temp;
          }
        }
      }

      // Tomar solo los primeros 3
      const top3 = [];
      for (let j = 0; j < Math.min(3, tallersDelAny.length); j++) {
        top3.push(tallersDelAny[j]);
      }
      groupedByYear[year] = top3;
    }

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
  height: 100%;
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
  height: 235px;
}
</style>
