<script setup>
import llistaTallers from "@/utils/components/centro/listaInscripciones.vue";
</script>
<template>
  <div>
    <div id="cuerpo">
      <div id="contenido">
        <h2>Tallers disponibles:</h2>
        <br />
        <llistaTallers></llistaTallers>
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
}

#contenido {
  margin-top: 20px;
  margin-left: 50px;
  font-family: "Coolvetica";
  font-weight: lighter;
}
</style>
