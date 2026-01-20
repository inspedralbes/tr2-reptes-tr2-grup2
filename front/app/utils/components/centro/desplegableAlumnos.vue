<script setup>
import { ref } from "vue";

const emit = defineEmits(["toggle", "select"]);
const options = [0, 1, 2, 3, 4];
const isOpen = ref(false);
const selected = ref(0);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
};

const selectOption = (val) => {
  selected.value = val;
  isOpen.value = false;
  emit("select", val);
  emit("toggle", false);
};

const getStackStyle = (index) => {
  if (isOpen.value) {
    return {
      transform: `translateY(${index * 26}px)`,
      zIndex: 100 - index,
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
  height: 26px;
}

.options-wrapper {
  position: relative;
}

.pill-option {
  position: absolute;
  width: 50px;
  padding: 4px 0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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
  background-color: rgba(121, 134, 203, 1);
  color: #ffffff;
}
.bg-level-4 {
  background-color: rgba(105, 118, 179, 1);
  color: #ffffff;
}

.pill-option:hover {
  filter: brightness(0.95);
}
</style>
