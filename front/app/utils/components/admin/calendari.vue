<template>
  <div class="box">
    <DatePicker
      expanded
      transparent
      borderless
      v-model="date"
      :min-date="new Date()"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { DatePicker } from "v-calendar";
import "v-calendar/style.css";

const date = ref(new Date());
</script>
<style scoped>
.box:deep(.vc-weekday-6),
.box:deep(.vc-weekday-7) {
  color: #9fa8da;
}
</style>
