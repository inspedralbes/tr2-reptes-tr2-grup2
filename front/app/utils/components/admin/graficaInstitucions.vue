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

// Datos ejemplo: Total de alumnos inscritos por Institución cada año
const dataInstituciones = {
    years: ['2023', '2024', '2025'],
    // Cada objeto es una institución con sus totales por año
    series: [
        {
            name: 'IES Joan Miró',
            data: [120, 150, 180] // Alumnos en 2023, 2024, 2025
        },
        {
            name: 'Escola Politècnica',
            data: [80, 210, 195]
        },
        {
            name: 'Institut de Tecnologies',
            data: [45, 90, 220]
        }
    ]
};

const initChart = () => {
    if (!chartRef.value) return;
    myChart = echarts.init(chartRef.value);

    const option = {
        title: {
            text: 'Instituciones con Mayor Volumen de Alumnos',
            subtext: 'Evolución por año de inscripción',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            bottom: '5%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dataInstituciones.years,
            name: 'Año'
        },
        yAxis: {
            type: 'value',
            name: 'Total Alumnos'
        },
        series: dataInstituciones.series.map(inst => ({
            name: inst.name,
            type: 'bar',
            emphasis: { focus: 'series' },
            label: {
                show: true,
                position: 'top'
            },
            data: inst.data
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
    max-width: 1000px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
</style>