<script setup>
import llistaTallers from "@/utils/components/centro/listaInscripciones.vue";
</script>
<template>
  <div class="page-container">
    <div id="cuerpo">
      <div id="contenido">
        <div class="header-with-tooltip">
          <h2>Tallers disponibles:</h2>
          <div class="tooltip-container">
            <i class="fas fa-question-circle tooltip-icon"></i>
            <div class="tooltip-text">Consulta els tallers disponibles per a la inscripció. Selecciona els que t'interessen i indica la quantitat d'alumnes.</div>
          </div>
        </div>
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
