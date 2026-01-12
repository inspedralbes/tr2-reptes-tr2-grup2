<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["toggle"]);
const options = [0, 1, 2, 3];
const isOpen = ref(false);
const selected = ref(0);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
};

const selectOption = (val) => {
  selected.value = val;
  isOpen.value = false;
  emit("toggle", false);
};

const getStackStyle = (index) => {
  if (isOpen.value) {
    return {
      transform: `translateY(${index * 32}px)`,
      zIndex: 100 - index, // El 3 queda arriba del 2
      opacity: 1,
    };
  }
  const isSelected = options[index] === selected.value;
  return {
    transform: `translateY(0px)`,
    zIndex: isSelected ? 10 : 0,
    opacity: isSelected ? 1 : 0,
    pointerEvents: isSelected ? "auto" : "none",
  };
};
</script>

<template>
  <div
    class="selector-container"
    @mouseleave="
      isOpen = false;
      emit('toggle', false);
    "
  >
    <div class="options-wrapper">
      <div
        v-for="(opt, index) in options"
        :key="opt"
        class="pill-option"
        :style="getStackStyle(index)"
        :class="[`bg-level-${opt}`]"
        @click="isOpen ? selectOption(opt) : toggleMenu()"
      >
        {{ opt }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.selector-container {
  position: relative;
  width: 50px;
  height: 35px;
}

.options-wrapper {
  position: relative;
}

.pill-option {
  position: absolute;
  width: 50px;
  height: 48px; /* Un poco más alta para que se solapen */
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  /* Ajuste visual del texto */
  padding-bottom: 12px;
}

/* Colores basados en la imagen */
.bg-level-0 {
  background-color: #e8eaf6;
  color: #3f51b5;
}
.bg-level-1 {
  background-color: #c5cae9;
  color: #3f51b5;
}
.bg-level-2 {
  background-color: #9fa8da;
  color: #283593;
}
.bg-level-3 {
  background-color: #7986cb;
  color: #ffffff;
  padding-bottom: 0;
}

/* El último (3) no necesita padding porque es la base del desplegable */
</style>
