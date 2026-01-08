<template>
  <div class="slider-container">
    <button v-show="!isAtStart" class="arrow-prev" @click="scrollPrev">
      <img src="/img/centro/flecha-izq.png" alt="Anterior" />
    </button>

    <div class="slider-wrapper" ref="sliderElement" @scroll="handleScroll">
      <div v-for="dia in tallers" :key="dia.diaNum" class="day-group">
        <p class="month-label">{{ dia.mes }}</p>
        <h3 class="date-label">{{ dia.diaSemana }}, {{ dia.diaNum }}</h3>

        <div class="cards-container">
          <div
            v-for="(taller, index) in dia.cursos"
            :key="taller.titulo"
            class="card"
          >
            <div class="card-info">
              <p class="title">{{ taller.titulo }}</p>
              <p class="location">{{ taller.lugar }}</p>
            </div>
            <div class="card-time">
              <span>
                <img
                  src="/img/centro/Clock.png"
                  alt="Reloj"
                  class="clock-icon"
                />
                {{ taller.hora }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button v-show="!isAtEnd" class="arrow-next" @click="scrollNext">
      <img src="/img/centro/flecha-drc.png" alt="Siguiente" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const sliderElement = ref(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

// Control de visibilidad de flechas con margen de error para evitar fallos de redondeo
const handleScroll = () => {
  if (sliderElement.value) {
    const { scrollLeft, scrollWidth, clientWidth } = sliderElement.value;
    isAtStart.value = scrollLeft <= 10;
    isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 20;
  }
};

// Movimiento basado en el ancho real de un bloque + el gap (30px)
const scrollNext = () => {
  if (sliderElement.value) {
    const dayGroup = sliderElement.value.querySelector(".day-group");
    const step = dayGroup
      ? dayGroup.clientWidth + 30
      : sliderElement.value.clientWidth;
    sliderElement.value.scrollBy({ left: step, behavior: "smooth" });
  }
};

const scrollPrev = () => {
  if (sliderElement.value) {
    const dayGroup = sliderElement.value.querySelector(".day-group");
    const step = dayGroup
      ? dayGroup.clientWidth + 30
      : sliderElement.value.clientWidth;
    sliderElement.value.scrollBy({ left: -step, behavior: "smooth" });
  }
};

onMounted(() => {
  handleScroll();
});

const tallers = ref([
  {
    mes: "Septembre",
    diaSemana: "Dilluns",
    diaNum: 23,
    cursos: [
      { titulo: "Curs de Vela", lugar: "Port de Barcelona", hora: "15:30" },
      {
        titulo: "Curs de Teatre",
        lugar: "Institut Santa María",
        hora: "15:30",
      },
    ],
  },
  {
    mes: "Octubre",
    diaSemana: "Dimarts",
    diaNum: 17,
    cursos: [
      { titulo: "Curs de Carpinteria", lugar: "La Pedrera", hora: "16:30" },
      { titulo: "Curs de Cosir", lugar: "Sastreria Laura", hora: "10:00" },
    ],
  },
  {
    mes: "Novembre",
    diaSemana: "Dimecres",
    diaNum: 12,
    cursos: [
      { titulo: "Curs de Cuina", lugar: "Mercat Central", hora: "18:00" },
      { titulo: "Curs de Pintura", lugar: "Museu d'Art", hora: "11:30" },
    ],
  },
  {
    mes: "Desembre",
    diaSemana: "Dijous",
    diaNum: 5,
    cursos: [
      { titulo: "Curs de Fotografia", lugar: "Estudi Nord", hora: "17:00" },
      { titulo: "Curs de Cerámica", lugar: "Taller Creatiu", hora: "10:30" },
    ],
  },
]);
</script>

<style scoped>
.slider-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 20px 0;
}

.slider-wrapper {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 30px;
  padding: 15px 5px;

  /* FUERZA EL AJUSTE PARA QUE NO SE VEA CORTADO */
  scroll-snap-type: x mandatory;

  /* Ocultar barra de scroll */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.slider-wrapper::-webkit-scrollbar {
  display: none;
}

.day-group {
  /* Asegura ver siempre 2 bloques */
  min-width: calc(50% - 15px);
  flex-shrink: 0;

  /* Indica al navegador dónde "imantar" el scroll */
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.month-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}
.date-label {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card {
  background-color: #c5cae9;
  border-radius: 25px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  min-height: 50px;
}

/* Tarjeta azul oscuro para días pares */
.day-group:nth-child(even) .card:nth-child(1) {
  background-color: #5c6bc0;
  color: white;
}

.title {
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
}
.location {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 5px 0 0 0;
}

.card-time span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}
.clock-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Invierte el color del reloj en tarjetas oscuras */
.day-group:nth-child(even) .card:nth-child(1) .clock-icon {
  filter: brightness(0) invert(1);
}

/* Estilos de las flechas actualizados */
.arrow-next,
.arrow-prev {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
  transition: transform 0.2s ease;
}

.arrow-next img,
.arrow-prev img {
  width: 45px;
  height: 45px;
  object-fit: contain;
  pointer-events: none;
}

.arrow-next:active,
.arrow-prev:active {
  transform: scale(0.8);
}

.arrow-prev {
  margin-right: 10px;
}
.arrow-next {
  margin-left: 10px;
}
</style>
