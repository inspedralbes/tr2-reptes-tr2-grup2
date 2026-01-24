<script setup>
import llistaEstados from "@/utils/components/centro/listaEstadoInscripciones.vue";
</script>
<template>
  <div>
    <div id="cuerpo">
      <div id="contenido">
        <div class="header-with-tooltip">
          <h2>Estat inscripcions:</h2>
          <div class="tooltip-container">
            <i class="fas fa-question-circle tooltip-icon"></i>
            <div class="tooltip-text">Visualitza l'estat de les teves inscripcions: acceptades, pendent de confirmació o denegades.</div>
          </div>
        </div>
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

.header-with-tooltip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-with-tooltip h2 {
  margin: 0;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-icon {
  color: #7986cb;
  font-size: 18px;
  cursor: help;
  transition: color 0.3s ease, transform 0.3s ease;
}

.tooltip-icon:hover {
  color: #3949ab;
  transform: scale(1.2);
}

.tooltip-text {
  visibility: hidden;
  background-color: #3949ab;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  padding: 10px 15px;
  position: absolute;
  z-index: 1;
  top: 125%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  font-weight: normal;
  box-shadow: 0 4px 12px rgba(57, 73, 171, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #3949ab transparent;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(5px);
}
</style>
