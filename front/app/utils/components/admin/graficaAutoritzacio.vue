<script setup>
import { ref, onMounted } from "vue";
import { getAllTallers } from "@/services/communicationManagerDatabase.js";

const tallers = ref([]);
const loading = ref(true);
const error = ref("");

// Contadores simples
const totalTallers = ref(0);
const tallersActius = ref(0);
const tallersFinalitzats = ref(0);
const percentatgeActius = ref(0);

// Función para parsear fecha en formato DD/MM/YYYY
const parseDate = (dateString) => {
    if (!dateString) return null;

    const parts = dateString.split("/");
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
};

// Cargar datos al montar el componente
onMounted(async () => {
    try {
        loading.value = true;
        error.value = "";

        const data = await getAllTallers();
        tallers.value = data;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let countActius = 0;
        let countFinalitzats = 0;

        for (let i = 0; i < tallers.value.length; i++) {
            const taller = tallers.value[i];

            try {
                let horari = {};
                if (typeof taller.horari === "string" && taller.horari.trim() !== "") {
                    horari = JSON.parse(taller.horari);
                } else if (taller.horari) {
                    horari = taller.horari;
                }

                const dataFiString = horari.DATAFI;

                if (dataFiString) {
                    const dataFi = parseDate(dataFiString);

                    if (dataFi) {
                        if (dataFi < hoy) {
                            countFinalitzats++;
                        } else {
                            countActius++;
                        }
                    }
                }
            } catch (e) {
                console.error("Error parseando horari del taller:", taller.id, e);
            }
        }

        totalTallers.value = countActius + countFinalitzats;
        tallersActius.value = countActius;
        tallersFinalitzats.value = countFinalitzats;

        if (totalTallers.value > 0) {
            percentatgeActius.value = Math.round((tallersActius.value / totalTallers.value) * 100);
        }

    } catch (err) {
        console.error("Error carregant tallers:", err);
        error.value = "Error al carregar les dades dels tallers";
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="tallers-status-container">
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Carregant dades...</p>
        </div>

        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
        </div>

        <div v-else class="content">
            <div class="header">
                <p class="subtitle">Total: {{ totalTallers }} tallers</p>
            </div>

            <div class="bars-container">
                <!-- Barra Actius -->
                <div class="bar-item">
                    <div class="bar-label-top">
                        <span class="label-text">Actius</span>
                        <span class="label-value">{{ tallersActius }}</span>
                    </div>
                    <div class="bar-wrapper">
                        <div class="bar bar-actius" :style="{
                            height: totalTallers > 0 ? (tallersActius / totalTallers * 100) + '%' : '0%'
                        }">
                        </div>
                    </div>
                </div>

                <!-- Barra Finalitzats -->
                <div class="bar-item">
                    <div class="bar-label-top">
                        <span class="label-text">Finalitzats</span>
                        <span class="label-value">{{ tallersFinalitzats }}</span>
                    </div>
                    <div class="bar-wrapper">
                        <div class="bar bar-finalitzats" :style="{
                            height: totalTallers > 0 ? (tallersFinalitzats / totalTallers * 100) + '%' : '0%'
                        }">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tallers-status-container {

    background: transparent;
    min-height: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    border-bottom: 1px solid #8383835b;
    margin-bottom: 20px;
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

.header {
    margin-top: 15px;
    text-align: right;
    margin-bottom: 10px;
    
}

.subtitle {
    font-size: 12px;
    color: #666;
    margin: 0;
    white-space: nowrap;
}

.bars-container {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    gap: 30px;
    padding: 0 20px;
    height: 140px;
}

.bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.bar-label-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.label-text {
    font-size: 11px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.label-value {
    font-size: 20px;
    font-weight: 700;
    color: #333;
}

.bar-wrapper {
    width: 100%;
    max-width: 80px;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.bar {
    width: 100%;
    min-height: 20px;
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    transition: height 1s ease-out;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
}

.bar-actius {
    background: linear-gradient(180deg, #5c6bc0 0%, #7986cb 100%);
}

.bar-finalitzats {
    background: linear-gradient(180deg, #9575cd 0%, #b39ddb 100%);
}

/* Responsive */
@media (max-width: 768px) {
    .bars-container {
        gap: 20px;
        padding: 0 10px;
    }

    .bar-wrapper {
        max-width: 60px;
    }
}
</style>