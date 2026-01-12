<script setup>
import { ref } from "vue";

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

// Toggle del desplegable al clicar el botón
const toggleDetalls = (id) => {
  filaActiva.value = filaActiva.value === id ? null : id;
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

      <!-- CONTENEDOR: fila + desplegable debajo -->
      <div
        v-for="(curso, cIdx) in taller.cursos"
        :key="cIdx"
        class="curso-item"
        :class="{ abierto: filaActiva === `${tIdx}-${cIdx}` }"
        :style="{ zIndex: filaActiva === `${tIdx}-${cIdx}` ? 100 : 1 }"
      >
        <!-- FILA (barra superior) -->
        <div class="fila-curso">
          <div class="col-titulo">
            <span class="texto-titulo">{{ curso.titulo }}</span>
          </div>

          <div class="col-info">
            <span class="info-item">
              <img src="/img/centro/calendar.png" class="icon" alt="icon" />
              {{ taller.diaNum }}/{{ getMesNum(taller.mes) }}
              <img src="/img/centro/clock.png" class="icon" alt="icon" />
              {{ curso.hora }}
            </span>
          </div>

          <button class="btn-detalls" @click="toggleDetalls(`${tIdx}-${cIdx}`)">
            <span class="btn-detalls-text">
              {{ filaActiva === `${tIdx}-${cIdx}` ? "− Detalls" : "+ Detalls" }}
            </span>
          </button>
        </div>

        <!-- DESPLEGABLE HACIA ABAJO -->
        <transition name="slide">
          <div v-if="filaActiva === `${tIdx}-${cIdx}`" class="desplegable">
            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit ante,
              suscipit felis ornare donec vehicula ultricies accumsan mauris
              ullamcorper, luctus blandit potenti fusce inceptos nec sagittis.
              Per aliquet aenean imperdiet hac volutpat at cursus tempus, eu
              hendrerit dictum nec id pulvinar magna integer, senectus ultrices
              penatibus turpis varius egestas porttitor.
            </p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lista-container {
  max-width: 1000px;
  height: 370px;
  overflow-y: auto;
  overflow-x: visible;
  padding: 10px 20px;
}

/* contenedor por item (fila + desplegable) */
.curso-item {
  position: relative;
  margin-bottom: 10px;
}

.curso-item.abierto {
  background: #d7dbff;
  border-radius: 25px;
  padding-bottom: 12px;
  margin-top: 0px;
  overflow: hidden;
}

p {
  padding: 0 25px 15px 25px;
  margin: 0;
}

.fila-curso {
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  height: 45px;
  position: relative;
}

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

/* Desplegable */
.desplegable {
  background-color: #d5dafb;
  margin-left: 0;
  position: relative;
  width: 100%;
  padding: 0px 0 0 0;
}

/* Animación del desplegable */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.25s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
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
