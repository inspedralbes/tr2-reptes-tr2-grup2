<script setup>
import { ref, onMounted, computed } from "vue";

const containerElement = ref(null);
const sliderElement = ref(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const paleta = [
  { bg: "#5C6BC0", text: "#1F1F1F" },
  { bg: "#C5CAE9", text: "#1F1F1F" },
  { bg: "#7E57C2", text: "#1F1F1F" },
  { bg: "#7986CB", text: "#1F1F1F" },
  { bg: "#9FA8DA", text: "#1F1F1F" },
  { bg: "#7986CB", text: "#1F1F1F" },
  { bg: "#26C6DA", text: "#1F1F1F" },
];

const colorMap = computed(() => {
  const map = {};
  let colorIndex = 0;

  tallers.value.forEach((grupo) => {
    grupo.dias.forEach((dia) => {
      dia.cursos.forEach((taller) => {
        if (!map[taller.titulo]) {
          map[taller.titulo] = paleta[colorIndex % paleta.length];
          colorIndex++;
        }
      });
    });
  });
  return map;
});

const getCardStyle = (titulo) => {
  const colores = colorMap.value[titulo] || paleta[0];
  return {
    backgroundColor: colores.bg,
    color: colores.text,
  };
};

const handleScroll = () => {
  if (sliderElement.value && containerElement.value) {
    const { scrollLeft, scrollWidth, clientWidth } = sliderElement.value;
    isAtStart.value = scrollLeft <= 10;
    isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 20;

    const leftOpacity = Math.min(scrollLeft / 50, 1);
    const rightDiff = scrollWidth - (scrollLeft + clientWidth);
    const rightOpacity = Math.min(rightDiff / 50, 1);

    containerElement.value.style.setProperty("--grad-left", leftOpacity);
    containerElement.value.style.setProperty("--grad-right", rightOpacity);
  }
};

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

const props = defineProps({
  tallers: {
    type: Array,
    default: () => [],
  },
});

const tallers = computed(() => props.tallers);
</script>

<template>
  <div v-if="tallers.length > 0">
    <div class="slider-container" ref="containerElement">
      <button class="arrow-prev" @click="scrollPrev" :style="{ opacity: isAtStart ? '0.3' : '1' }">
        <img src="/img/centro/flecha-izq.png" alt="Anterior" />
      </button>

      <div class="slider-wrapper" ref="sliderElement" @scroll="handleScroll">
        <template v-for="grupo in tallers" :key="grupo.mes">
          <div v-for="(dia, index) in grupo.dias" :key="dia.diaNum" class="day-group">
            <p class="month-label" :class="{ 'hidden-label': index !== 0 }">
              {{ grupo.mes }}
            </p>

            <h3 class="date-label">{{ dia.diaSemana }}, {{ dia.diaNum }}</h3>

            <div class="cards-container">
              <div v-for="taller in dia.cursos" :key="taller.titulo" class="card" :style="getCardStyle(taller.titulo)">
                <div class="card-info">
                  <p class="title">{{ taller.titulo }}</p>
                  <p class="location">{{ taller.lugar }}</p>
                </div>
                <div class="card-time">
                  <span>
                    <img src="/img/centro/clock.png" alt="Reloj" class="clock-icon" />
                    {{ taller.hora }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <button class="arrow-next" @click="scrollNext" :style="{ opacity: isAtEnd ? '0.3' : '1' }">
        <img src="/img/centro/flecha-drc.png" alt="Siguiente" />
      </button>
    </div>
  </div>
  <div v-else class="empty-state">
    <p>No hi ha tallers actius de moment.</p>
  </div>

</template>

<style scoped>
.slider-container {
  position: relative;
  width: 100%;
  --grad-left: 0;
  --grad-right: 1;
}

.slider-wrapper {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 30px;
  padding: 10px 40px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to right,
      rgba(0, 0, 0, calc(1 - var(--grad-left))) 0%,
      black 10%,
      black 90%,
      rgba(0, 0, 0, calc(1 - var(--grad-right))) 100%);
  mask-image: linear-gradient(to right,
      rgba(0, 0, 0, calc(1 - var(--grad-left))) 0%,
      black 10%,
      black 90%,
      rgba(0, 0, 0, calc(1 - var(--grad-right))) 100%);
}

.slider-wrapper::-webkit-scrollbar {
  display: none;
}

.day-group {
  min-width: 300px;
  /* Tamaño fijo para consistencia */
  flex-shrink: 0;
  scroll-snap-align: center;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
}

/* Scrollbar fina */
.cards-container::-webkit-scrollbar {
  width: 4px;
}

.cards-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.card {
  border-radius: 20px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.month-label {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 2px;
  min-height: 1rem;
}

.hidden-label {
  visibility: hidden;
}

.date-label {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.title {
  font-weight: bold;
  font-size: 1rem;
  margin: 0;
}

.location {
  font-size: 0.8rem;
  opacity: 0.8;
}

.clock-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
  filter: brightness(0) invert(1);
}

.arrow-prev,
.arrow-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.arrow-prev {
  left: -5px;
}

.arrow-next {
  right: -5px;
}

.arrow-prev img,
.arrow-next img {
  width: 25px;
  height: 25px;
}


.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
  
}
</style>
