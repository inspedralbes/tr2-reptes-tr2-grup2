<script setup>
import listaFinalizados from "@/utils/components/centro/listaFinalizados.vue";
</script>
<template>
  <div class="page-container">
    <div id="cuerpo">
      <div id="contenedor">
        <div class="header-with-tooltip">
          <h3>Tallers finalitzats:</h3>
          <div class="tooltip-container">
            <i class="fas fa-question-circle tooltip-icon"></i>
            <div class="tooltip-text">Consulta els tallers que ja han finalitzat i els seus resultats.</div>
          </div>
        </div>
        <div id="contenido">
          <listaFinalizados />
        </div>
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

h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

#list-wrapper {
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 30px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  /* Altura fluida con scroll si es necesario */
  height: calc(100vh - 350px);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.header-with-tooltip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-with-tooltip h3 {
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
