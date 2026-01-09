<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarAdmin from "@/layouts/navBarAdmin.vue";
import graficaTallers from "@/utils/components/admin/graficaTallers.vue";
import graficaInstitucions from "@/utils/components/admin/graficaInstitucions.vue";
import calendari from "@/utils/components/admin/calendari.vue"

</script>
<template>
  <Encabezado />
  <navBarAdmin />
  <graficaTallers />
  <graficaInstitucions />
  <calendari />
</template>
<style scoped></style>
