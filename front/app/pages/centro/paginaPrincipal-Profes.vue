<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import tallerSliders from "@/utils/components/centro/tallersSlider.vue";
</script>

<template>
  <Encabezado />
  <div id="cuerpo">
    <navProfes />
    <div id="contenido">
      <h2>Bon día, <span id="user">*UserName*</span>:</h2>
      <br />
      <h3>Tallers actius:</h3>
      <div id="slider">
        <tallerSliders />
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
  background-color: #f5f5f5;
  min-height: 555px;
}

#contenido {
  margin-top: 30px;
  margin-left: 50px;
  font-family: "Coolvetica";
  background-color: #e0e0e0;
  border-radius: 20px;
  padding: 30px;
  width: 1050px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  height: 430px;
  display: flex;
  flex-direction: column;
}

#slider {
  width: 100%;
  flex-grow: 1;
}

#user {
  color: #5c6bc0;
  font-weight: bold;
}
</style>
