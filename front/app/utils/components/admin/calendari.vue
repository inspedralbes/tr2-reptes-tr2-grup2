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

.box:deep(.vc-header) {
  padding: 10px 0;
}

.box:deep(.vc-title) {
  font-size: 1rem;
}

.box:deep(.vc-day) {
  font-size: 0.9rem;
}

/* RESPONSIVE PARA TABLETS (768px - 1024px) */
@media (max-width: 1024px) {
  .box:deep(.vc-title) {
    font-size: 0.95rem;
  }

  .box:deep(.vc-day) {
    font-size: 0.85rem;
  }

  .box:deep(.vc-header) {
    padding: 8px 0;
  }
}

/* RESPONSIVE PARA MÓVILES (hasta 768px) */
@media (max-width: 768px) {
  .box {
    padding: 5px;
    overflow: hidden;
  }

  .box:deep(.vc-pane-container) {
    max-width: 100%;
  }

  .box:deep(.vc-title) {
    font-size: 0.9rem;
  }

  .box:deep(.vc-day) {
    font-size: 0.8rem;
    padding: 3px;
  }

  .box:deep(.vc-header) {
    padding: 5px 0;
  }

  .box:deep(.vc-weekday) {
    font-size: 0.75rem;
  }
}

/* RESPONSIVE PARA IPHONE Y MÓVILES PEQUEÑOS (hasta 480px) */
@media (max-width: 480px) {
  .box {
    padding: 3px;
  }

  .box:deep(.vc-title) {
    font-size: 0.8rem;
  }

  .box:deep(.vc-day) {
    font-size: 0.7rem;
    padding: 2px;
  }

  .box:deep(.vc-header) {
    padding: 3px 0;
  }

  .box:deep(.vc-weekday) {
    font-size: 0.65rem;
  }

  .box:deep(.vc-arrow) {
    width: 20px;
    height: 20px;
  }
}
</style>
