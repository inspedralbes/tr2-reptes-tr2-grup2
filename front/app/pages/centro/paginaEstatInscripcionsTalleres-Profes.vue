<script setup>
import llistaEstados from "@/utils/components/centro/listaEstadoInscripciones.vue";
</script>
<template>
  <div>
    <div id="cuerpo">
      <div id="contenido">
        <h2>Estat inscripcions:</h2>
        <br />
        <llistaEstados />
      </div>

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
  font-size: 20px;
}

#contenido {
  margin-top: 20px;
  margin-left: 50px;
  font-family: "Coolvetica";
  font-weight: lighter;
}
</style>
