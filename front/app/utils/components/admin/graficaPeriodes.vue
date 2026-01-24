<script setup>
import { ref, onMounted } from "vue";
import { getPeriodes, getAllTallers, getAllInstitucions } from "@/services/communicationManagerDatabase.js";

const periodes = ref([]);
const tallers = ref([]);
const institucions = ref([]);
const loading = ref(true);
const error = ref("");

// Array para almacenar los datos agrupados por año
const periodesPerAny = ref([]);

// Función para extraer el año de una fecha en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
const extractYear = (dateString) => {
    if (!dateString) return null;

    // Crear objeto Date desde el string ISO
    const date = new Date(dateString);

    // Verificar que la fecha es válida
    if (isNaN(date.getTime())) return null;

    // Retornar el año
    return date.getFullYear().toString();
};

// Cargar datos al montar el componente
onMounted(async () => {
    try {
        loading.value = true;
        error.value = "";

        // Cargar todos los datos
        const [periodesRes, tallersRes, institucionsRes] = await Promise.all([
            getPeriodes(),
            getAllTallers(),
            getAllInstitucions()
        ]);

        periodes.value = periodesRes;
        tallers.value = tallersRes;
        institucions.value = institucionsRes;

        console.log("Períodes raw data:", periodes.value);

        // Procesar datos SIN usar map/filter
        // Primero, agrupar períodos por año
        const periodesByYear = {};

        for (let i = 0; i < periodes.value.length; i++) {
            const periode = periodes.value[i];
            console.log("Processant període:", periode);
            const year = extractYear(periode.dataIni);
            console.log("Any extret:", year, "de dataIni:", periode.dataIni);

            if (year) {
                if (!periodesByYear[year]) {
                    periodesByYear[year] = [];
                }

                const periodeId = periode.id;

                // Contar talleres de este período
                let countTallers = 0;
                for (let j = 0; j < tallers.value.length; j++) {
                    if (tallers.value[j].periode === periodeId) {
                        countTallers++;
                    }
                }

                // Contar instituciones únicas que tienen talleres en este período
                const institucionsSet = {};
                for (let j = 0; j < tallers.value.length; j++) {
                    if (tallers.value[j].periode === periodeId && tallers.value[j].institucio) {
                        institucionsSet[tallers.value[j].institucio] = true;
                    }
                }

                // Contar cuántas instituciones únicas hay
                let countInstitucions = 0;
                for (let key in institucionsSet) {
                    countInstitucions++;
                }

                periodesByYear[year].push({
                    nom: periode.nom,
                    talleres: countTallers,
                    centres: countInstitucions
                });
            }
        }

        // Convertir el objeto en un array ordenado por año
        const yearsArray = [];
        for (let year in periodesByYear) {
            yearsArray.push({
                year: year,
                periodes: periodesByYear[year]
            });
        }

        // Ordenar por año (de más antiguo a más reciente)
        for (let i = 0; i < yearsArray.length - 1; i++) {
            for (let j = 0; j < yearsArray.length - i - 1; j++) {
                if (parseInt(yearsArray[j].year) > parseInt(yearsArray[j + 1].year)) {
                    const temp = yearsArray[j];
                    yearsArray[j] = yearsArray[j + 1];
                    yearsArray[j + 1] = temp;
                }
            }
        }

        periodesPerAny.value = yearsArray;

        console.log("Períodes agrupats per any:", periodesPerAny.value);
    } catch (err) {
        console.error("Error carregant dades de períodes:", err);
        error.value = "Error al carregar les dades dels períodes";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="periodes-container">
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Carregant dades...</p>
        </div>

        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
        </div>

        <div v-else class="content">

            <div class="years-container">
                <div v-for="(yearData, index) in periodesPerAny" :key="index" class="year-section">
                    <div class="year-header">{{ yearData.year }}</div>

                    <div class="chart-container">
                        <div v-for="(periode, pIndex) in yearData.periodes" :key="pIndex" class="periode-group">
                            <div class="bars-wrapper">
                                <!-- Barra de Centres -->
                                <div class="bar-column">
                                    <div class="bar-container">
                                        <div class="bar bar-centres" :style="{
                                            height: (periode.centres * 20) + 'px'
                                        }">
                                        </div>
                                    </div>
                                    <div class="bar-value">{{ periode.centres }}</div>
                                </div>

                                <!-- Barra de Talleres -->
                                <div class="bar-column">
                                    <div class="bar-container">
                                        <div class="bar bar-talleres" :style="{
                                            height: (periode.talleres * 20) + 'px'
                                        }">
                                        </div>
                                    </div>
                                    <div class="bar-value">{{ periode.talleres }}</div>
                                </div>
                            </div>

                            <!-- Nombre del período -->
                            <div class="periode-name">{{ periode.nom }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="legend">
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #5c6bc0;"></span>
                    <span>Centres educatius</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: #3949ab;"></span>
                    <span>Tallers</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.periodes-container {
    background: transparent;
    min-height: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin-top: -10%;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(92, 107, 192, 0.2);
    border-top-color: #5c6bc0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
}

.error p {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
}

.content {
    display: flex;
    flex-direction: column;
}

.years-container {
margin-top: 20%;
    display: flex;
    flex-direction: row;
    gap: 30px;
    overflow-x: auto;
}

.years-container::-webkit-scrollbar {
    height: 6px;
}

.years-container::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
}

.years-container::-webkit-scrollbar-thumb {
    background: #5c6bc0;
    border-radius: 10px;
}

.years-container::-webkit-scrollbar-thumb:hover {
    background: #3949ab;
}

.year-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: fit-content;
}

.year-header {
    font-size: 14px;
    font-weight: 700;
    color: #3949ab;
    text-align: center;
    padding: 8px 15px;
    background-color: #e8eaf6;
    border-radius: 30px;
    white-space: nowrap;
}

.chart-container {
    margin-top: -30px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 15px;
    padding: 0 10px;
    min-height: 180px;
}

.periode-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.bars-wrapper {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.bar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.bar-container {
    width: 30px;
    height: 140px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.bar {
    width: 100%;
    min-height: 10px;
    border-radius: 4px 4px 0 0;
    transition: height 1s ease-out;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.bar-centres {
    background-color: #5c6bc0;
}

.bar-talleres {
    background-color: #3949ab;
}

.bar-value {
    font-size: 14px;
    font-weight: 700;
    color: #333;
}

.bar-label {
    font-size: 9px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.periode-name {
    font-size: 11px;
    font-weight: 600;
    color: #333;
    text-align: center;
    max-width: 80px;
    word-wrap: break-word;
}

.legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #666;
    font-weight: 500;
}

.legend-color {
    width: 14px;
    height: 14px;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
    .chart-container {
        gap: 10px;
        overflow-x: auto;
        justify-content: flex-start;
    }

    .bar-container {
        width: 25px;
        height: 120px;
    }

    .periode-name {
        font-size: 10px;
        max-width: 60px;
    }
}
</style>