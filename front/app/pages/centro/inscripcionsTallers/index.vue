<script setup>
import llistaTallers from "@/utils/components/centro/listaInscripciones.vue";
</script>
<template>
  <div class="page-container">
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

.page-container {
  width: 100%;
  flex: 1;
}

#cuerpo {
  display: flex;
  min-height: calc(100vh - 100px);
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  justify-content: center;
  width: 100%;
  font-size: 20px;
}

#contenido {
  margin-top: 3%;
  margin-left: 4%;
  margin-right: auto;
  font-family: "Coolvetica";
  font-weight: lighter;
  width: 95%;
  max-width: 1400px;
}

@media (max-width: 768px) {
  #cuerpo {
    min-height: calc(100vh - 60px);
    align-items: flex-start;
  }

  #contenido {
    width: 95%;
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
