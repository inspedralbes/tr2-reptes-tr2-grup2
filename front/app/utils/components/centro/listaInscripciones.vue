<script setup>
import { ref } from "vue";
import SelectorAlumnos from "@/utils/components/centro/desplegableAlumnos.vue";

const tallers = ref([
  {
    mes: "Septembre",
    diaNum: 23,
    cursos: [
      { titulo: "Curs de Vela", hora: "15:30" },
      { titulo: "Curs de Teatre", hora: "15:30" },
      { titulo: "Curs de Teatre", hora: "15:30" },
      { titulo: "Curs de Teatre", hora: "15:30" },
    ],
  },
  {
    mes: "Octubre",
    diaNum: 17,
    cursos: [
      { titulo: "Curs de Carpinteria", hora: "16:30" },
      { titulo: "Curs de Cosir", hora: "10:00" },
    ],
  },
]);

// Guardamos el ID de la fila que tiene el desplegable abierto
const filaActiva = ref(null);

const actualizarPrioridad = (id, isOpen) => {
  filaActiva.value = isOpen ? id : null;
};

const getMesNum = (mes) => {
  const meses = {
    Septembre: "09",
    Octubre: "10",
    Novembre: "11",
    Desembre: "12",
  };
  return meses[mes] || "00";
};
</script>

<template>
  <div class="lista-container">
    <div v-for="(taller, tIdx) in tallers" :key="tIdx" class="seccion-mes">
      <h2 class="mes-titulo">{{ taller.mes }}</h2>

      <div
        v-for="(curso, cIdx) in taller.cursos"
        :key="cIdx"
        class="fila-curso"
        :style="{ zIndex: filaActiva === `${tIdx}-${cIdx}` ? 100 : 1 }"
      >
        <div class="col-titulo">
          <span class="texto-titulo">{{ curso.titulo }}</span>
        </div>

        <div class="col-info">
          <span class="info-item">
            <img src="/img/centro/calendar.png" class="icon" />
            {{ taller.diaNum }}/{{ getMesNum(taller.mes) }}
            <img src="/img/centro/clock.png" class="icon" />
            {{ curso.hora }}
          </span>
        </div>

        <button class="btn-detalls">
          <span class="btn-detalls-text">+ Detalls</span>
        </button>

        <div class="desplegable">
          <SelectorAlumnos
            @toggle="(state) => actualizarPrioridad(`${tIdx}-${cIdx}`, state)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lista-container {
  max-width: 1000px;
  height: 370px;
  overflow-y: auto;
  overflow-x: visible; /* IMPORTANTE: para que no corte el desplegable hacia los lados */
  padding: 10px 20px;
}

.fila-curso {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  height: 45px;
  position: relative; /* Necesario para que el z-index dinámico funcione */
}

/* Estilos de tus columnas (mantengo los tuyos con ligeros ajustes de z-index) */
.col-titulo {
  background-color: #7986cb;
  color: #1a1a1a;
  z-index: 3;
  flex: 2;
  width: 300px;
  min-height: 35px;
  display: flex;
  align-items: center;
  padding-left: 25px;
  border-radius: 25px;
  font-weight: bold;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -50px;
  z-index: 2;
  flex: 2;
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 15px;
  border-radius: 25px;
}

.btn-detalls {
  background-color: #c5cae9;
  margin-left: -30px;
  z-index: 1;
  width: 120px;
  min-height: 35px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
}
.btn-detalls-text {
  margin-left: 30px;
}

.desplegable {
  margin-left: 50px;
  position: relative;
  width: 50px;
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
.mes-titulo {
  font-size: 1.5rem;
  color: #333;
  margin: 20px 0 10px 0;
}
</style>
