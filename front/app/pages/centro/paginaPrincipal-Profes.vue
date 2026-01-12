<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import tallerSliders from "@/utils/components/centro/tallersSlider.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="cuerpo">
    <navProfes></navProfes>
    <div id="contenido">
      <h2>Bon día, <span id="user">*UserName*</span>:</h2>
      <br />
      <h3>Tallers actius:</h3>
      <tallerSliders></tallerSliders>
    </div>
  </div>
</template>
<style scoped>
#cuerpo {
  display: flex;
}
#contenido {
  margin-top: 50px;
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
}
#user {
  color: #5c6bc0;
  font-weight: bold;
}
</style>
