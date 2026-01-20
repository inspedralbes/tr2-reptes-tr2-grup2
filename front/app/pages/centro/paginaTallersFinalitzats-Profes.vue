<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import listaFinalizados from "@/utils/components/centro/listaFinalizados.vue";
</script>
<template>
  <Encabezado />
  <div id="cuerpo">
    <navProfes />

    <div id="contenedor">
      <h3>Tallers finalitzats:</h3>
      <div id="contenido">
        <listaFinalizados />
      </div>
    </div>
  </div>
</template>
<style scoped>
#cuerpo {
  display: flex;
  background-color: #f5f5f5;
  height: calc(100vh - 85px);
  overflow: hidden;
}

#contenedor {
  margin-top: 30px;
  margin-left: 50px;
  font-family: "Coolvetica";
  font-size: 25px;
}

#contenido {
  margin-top: 30px;
  margin-left: 40px;
  font-family: "Coolvetica";
  background-color: #e0e0e0;
  border-radius: 20px;
  padding: 30px;
  width: 950px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  height: 330px;
  display: flex;
  flex-direction: column;
}
</style>
