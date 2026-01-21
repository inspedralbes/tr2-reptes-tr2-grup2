<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navProfes from "@/layouts/navBarProfes.vue";
import { ref, onMounted } from "vue";
import {
  getAllTallers,
  getAllInscripcions,
} from "@/services/communicationManagerDatabase";
</script>
<template>
  <Encabezado />
  <div id="cuerpo">
    <navProfes />
    <div id="contenido">
      <h3>Tallers finalitzats:</h3>
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

#contenido {
  margin-top: 30px;
  margin-left: 50px;
  font-family: "Coolvetica";
  background-color: #e0e0e0;
  border-radius: 20px;
  padding: 30px;
  width: 1050px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  height: 330px;
  display: flex;
  flex-direction: column;
}
</style>
