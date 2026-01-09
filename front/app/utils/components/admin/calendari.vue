<template>
    <div class="calendar-container">
        <VCalendar view="month" :attributes="attributes" expanded trim-weeks @dayclick="onDayClick" />

        <div v-if="selectedDay" class="event-detail">
            <h3>Talleres el {{ selectedDay.date.toLocaleDateString() }}</h3>
            <div v-for="attr in selectedDay.attributes" :key="attr.key">
                <p><strong>Taller:</strong> {{ attr.customData.nomTaller }}</p>
                <p><strong>Profesorado:</strong> {{ attr.customData.profes }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Simulamos datos que vendrían de tu tabla 'Assistencia' y 'Tallers'
const assistencias = ref([
    {
        id: 1,
        id_taller: 101,
        nom_taller: 'Robótica Avanzada',
        dia: new Date(2026, 0, 15), // Enero 15, 2026
        profes: 'Marc Soler, Laura Vidal',
        color: 'blue'
    },
    {
        id: 2,
        id_taller: 102,
        nom_taller: 'Diseño 3D',
        dia: new Date(2026, 0, 20),
        profes: 'Carles Pont',
        color: 'red'
    }
]);

const selectedDay = ref(null);

// Convertimos los datos de la DB al formato de "atributos" de V-Calendar
const attributes = computed(() => [
    ...assistencias.value.map(asist => ({
        key: asist.id,
        highlight: asist.color, // Crea un círculo de color en el día
        dates: asist.dia,
        popover: {
            label: asist.nom_taller,
            visibility: 'hover'
        },
        customData: {
            nomTaller: asist.nom_taller,
            profes: asist.profes
        }
    }))
]);

const onDayClick = (day) => {
    selectedDay.value = day;
};
</script>

<style scoped>
.calendar-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.event-detail {
    margin-top: 20px;
    padding: 15px;
    border-left: 4px solid #3b82f6;
    background: #f0f7ff;
}

/* Ajustes para que el calendario se vea bien en tu dashboard */
:deep(.vc-container) {
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>