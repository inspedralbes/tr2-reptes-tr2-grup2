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
@font-face {
  font-family: "Coolvetica";
  src: url(/assets/fuentes/coolvetica/Coolvetica\ Rg.otf);
}
#cuerpo {
  display: flex;
  height: calc(100vh - 85px);
  overflow: hidden;
}
#contenido {
  margin-top: 20px;
  margin-left: 50px;
  font-family: "Coolvetica";
  font-weight: lighter;
  height: 300px;
}
</style>
