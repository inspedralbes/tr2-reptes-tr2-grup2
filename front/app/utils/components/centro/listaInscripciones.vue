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
  <div id="container">
    <div class="header-lista">
      <button id="btn-filtro">Filtres</button>
      <p>Alumnes</p>
    </div>
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
  </div>
</template>

<style scoped>
/* Contenedor principal (el recuadro gris) */
#container {
  margin-top: -25px;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 25px;
  width: 1050px;
  height: 380px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Header alineado a la derecha */
.header-lista {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 40px;
  margin-bottom: 15px;
  padding-right: 60px; /* Alineado con el selector numérico */
}

.header-lista p {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

#btn-filtro {
  background-color: #7986cb;
  border: 3px solid #3949ab;
  border-radius: 30px;
  color: #1d1d1d;
  font-weight: bold;
  padding: 6px 18px;
  font-size: 15px;
  cursor: pointer;
}

/* Contenedor de la lista */
.lista-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 20px; /* Espacio para que el scroll no toque las filas */
}

/* --- ESTILO DE LAS FILAS (Cápsulas como en la imagen) --- */
.fila-curso {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  height: 40px;
  position: relative;
}

/* Columna Título (Azul oscuro izquierda) */
.col-titulo {
  background-color: #7986cb;
  margin-left: 150px;
  color: #1a1a1a;
  z-index: 3;
  width: 220px;
  height: 36px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Columna Info (Azul medio centro) */
.col-info {
  background-color: #9fa8da;
  margin-left: -40px;
  z-index: 2;
  width: 240px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-left: 30px;
  border-radius: 20px;
  font-size: 0.85rem;
}

/* Botón Detalles (Azul claro derecha) */
.btn-detalls {
  background-color: #c5cae9;
  margin-left: -40px;
  z-index: 1;
  width: 180px;
  height: 36px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  text-align: right;
  padding-right: 25px;
  font-size: 0.85rem;
}

/* Selector numérico a la derecha (Alumnes) */
.desplegable {
  margin-left: auto;
  margin-right: 30px;
  width: 45px;
}

/* --- PERSONALIZACIÓN DEL SCROLLBAR --- */
.lista-container::-webkit-scrollbar {
  width: 6px;
}

.lista-container::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 10px;
}

.lista-container::-webkit-scrollbar-thumb {
  background: #878787;
  border-radius: 10px;
}

/* Títulos de Mes */
.mes-titulo {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 10px 0px 20px 5px;
  margin-left: 70px;
}

.icon {
  width: 14px;
  height: 14px;
}
</style>
