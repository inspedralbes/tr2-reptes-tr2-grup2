<template>
    <div class="stats-container">
        <div ref="chartRef" class="main-chart"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref(null);
let myChart = null;

// Datos ejemplo: Agrupados por Año -> Top 3 Talleres
// En una app real, esto vendría filtrado por tu backend (Prisma)
const dataByYear = {
    '2023': [
        { name: 'Robótica', value: 45 },
        { name: 'Teatro', value: 32 },
        { name: 'Cocina', value: 28 }
    ],
    '2024': [
        { name: 'IA Generativa', value: 60 },
        { name: 'Robótica', value: 55 },
        { name: 'Diseño 3D', value: 40 }
    ],
    '2025': [
        { name: 'Ciberseguridad', value: 75 },
        { name: 'IA Generativa', value: 70 },
        { name: 'Sostenibilidad', value: 50 }
    ]
};

const initChart = () => {
    if (!chartRef.value) return;
    myChart = echarts.init(chartRef.value);

    const years = Object.keys(dataByYear);

    // Preparamos los nombres de los talleres para el eje X 
    // (Puesto 1, Puesto 2, Puesto 3)
    const option = {
        title: {
            text: 'Top 3 Talleres por Año',
            left: 'center',
            top: 10
        },
        legend: {
            data: years,
            bottom: 10
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        xAxis: {
            type: 'category',
            data: ['1º Más pedido', '2º Más pedido', '3º Más pedido']
        },
        yAxis: {
            type: 'value',
            name: 'Alumnos'
        },
        series: years.map(year => ({
            name: year,
            type: 'bar',
            barGap: '10%', // Espacio entre barras de diferentes años
            label: {
                show: true,
                position: 'top',
                // Mostramos el nombre del taller encima de la barra
                formatter: (params) => {
                    return dataByYear[year][params.dataIndex].name;
                },
                fontSize: 10
            },
            data: dataByYear[year].map(d => d.value)
        }))
    };

    myChart.setOption(option);
};

const handleResize = () => myChart?.resize();

onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    myChart?.dispose();
});
</script>

<style scoped>
.stats-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 20px;
}

.main-chart {
    width: 100%;
    max-width: 900px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
</style>