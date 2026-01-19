<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import llistaEstados from "@/utils/components/centro/listaEstadoInscripciones.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="cuerpo">
    <navProfes></navProfes>
    <div id="contenido">
      <h2>Tallers disponibles:</h2>
      <br />
      <llistaEstados />
    </div>
  </div>
</template>
<style scoped>
#cuerpo {
  display: flex;
}
#contenido {
  margin-top: 20px;
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
}
</style>
