<template>
  <div class="stats-container">
    <div v-if="loading" class="loading-state">
      <img src="/assets/gifs/loading.gif" alt="Carregant..." width="30" height="30" />
    </div>
    <div ref="chartRef" class="main-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
// Ajusta la ruta d'importació
import { getAllTallers, getAllInstitucions } from '@/services/communicationManagerDatabase';

const chartRef = ref(null);
const loading = ref(true);
let myChart = null;

const initChart = (institutionNames, seriesData) => {
  if (!chartRef.value) return;
  if (myChart) myChart.dispose();

  myChart = echarts.init(chartRef.value);

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
      text: 'Institucions amb Major Volum d\'Alumnes',
      subtext: 'Total de places disponibles',
      left: 'center',
      top: '1%',
      textStyle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#333'
      },
      subtextStyle: {
        fontSize: 12,
        color: '#666'
      }
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
      },
      formatter: (params) => {
        const data = params[0];
        return `<strong>${data.name}</strong><br/>Total Alumnes: <strong>${data.value}</strong>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: institutionNames,
      axisLabel: {
        show: false
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
      name: 'Total Alumnes',
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
    series: [{
      name: 'Total Alumnes',
      type: 'bar',
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        fontSize: 12,
        fontWeight: 600,
        color: '#333'
      },
      data: seriesData[0].data.map((value, index) => ({
        value: value,
        itemStyle: {
          color: blueColors[index % blueColors.length],
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 8,
          shadowOffsetY: 3
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetY: 5,
          shadowColor: 'rgba(57, 73, 171, 0.4)'
        }
      }
    }]
  };

  myChart.setOption(option);
};

const fetchData = async () => {
  try {
    loading.value = true;
    // Demanem les dues coses en paral·lel
    const [tallers, institucions] = await Promise.all([
      getAllTallers(),
      getAllInstitucions()
    ]);

    console.log('🔍 DEBUG - Institucions recibidas:', institucions);
    console.log('🔍 DEBUG - Tallers recibidos:', tallers);

    if (tallers.length > 0) {
      console.log('🔍 Primer taller:', tallers[0]);
      console.log('🔍 Propiedades del taller:', Object.keys(tallers[0]));
    }

    // NUEVA LÓGICA: Mostrar instituciones en el eje X con el total de plazas
    // En lugar de agrupar por años (que no existen), mostramos el total por institución

    const instData = institucions.map(inst => {
      // Calcular el total de plazas de todos los tallers de esta institución
      const tallersDeInst = tallers.filter(t => t.institucio === inst.id);
      const totalPlazas = tallersDeInst.reduce((sum, t) => sum + (t.places_max || 0), 0);

      return {
        nom: inst.nom,
        total: totalPlazas
      };
    });

    // Filtrar instituciones sin datos (solo las que tienen plazas)
    const activeInst = [];
    for (let i = 0; i < instData.length; i++) {
      if (instData[i].total > 0) {
        activeInst.push(instData[i]);
      }
    }

    // Ordenar de mayor a menor usando bubble sort
    for (let i = 0; i < activeInst.length - 1; i++) {
      for (let j = 0; j < activeInst.length - i - 1; j++) {
        if (activeInst[j].total < activeInst[j + 1].total) {
          // Intercambiar posiciones
          const temp = activeInst[j];
          activeInst[j] = activeInst[j + 1];
          activeInst[j + 1] = temp;
        }
      }
    }

    console.log('📊 Datos procesados:', activeInst);

    // Preparar datos para ECharts
    const names = [];
    const values = [];

    // Extraer nombres y valores en arrays separados
    for (let i = 0; i < activeInst.length; i++) {
      names.push(activeInst[i].nom);
      values.push(activeInst[i].total);
    }

    initChart(names, [{ name: 'Total Alumnes', data: values }]);

  } catch (error) {
    console.error("Error obtenint dades institucions:", error);
  } finally {
    loading.value = false;
  }
};

const handleResize = () => myChart?.resize();

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});
</script>

<style scoped>
.stats-container {
  width: 90%;
  display: flex;
  justify-content: center;
  padding: 0;
  position: relative;
  height: 100%;
}

.loading-state {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #666;
}

.main-chart {
  margin-left: 70px;
  width: 100%;
  height: 270px;
}

/* RESPONSIVE PARA TABLETS (768px - 1024px) */
@media (max-width: 1024px) {
  .stats-container {
    width: 100%;
  }

  .main-chart {
    margin-left: 50px;
    height: 240px;
  }
}

/* RESPONSIVE PARA MÓVILES (hasta 768px) */
@media (max-width: 768px) {
  .stats-container {
    width: 100%;
    padding: 5px;
    justify-content: center;
    overflow: hidden;
  }

  .main-chart {
    margin-left: 0;
    height: 250px;
    width: 100%;
    overflow: hidden;
  }
}

/* RESPONSIVE PARA IPHONE Y MÓVILES PEQUEÑOS (hasta 480px) */
@media (max-width: 480px) {
  .stats-container {
    width: 100%;
    padding: 0;
    justify-content: center;
    overflow: hidden;
  }

  .main-chart {
    margin-left: 0;
    height: 280px;
    width: 100%;
    overflow: hidden;
  }
}
</style>