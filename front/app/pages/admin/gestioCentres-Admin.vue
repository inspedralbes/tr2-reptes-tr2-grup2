<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarProfes from "@/layouts/navBarProfes.vue";
import llistaCentres from "@/utils/components/centro/listaInscripciones.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="body">
    <navBarProfes></navBarProfes>
    <div id="content">
      <div class="header-Centres">
        <h2>Gestió centres</h2>
        <button class="btn-filtres">Filtres</button>
      </div>
      <div class="container-courses">
        <br />
        <llistaCentres></llistaCentres>
      </div>
    </div>
  </div>
</template>
<style scoped>
#body {
  display: flex;
}

#content {
  margin-top: 50px;
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
}
.header-Centres {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-filtres {
  background-color: #7986cb;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 22px;
  border: 2px solid #5d6bc4;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-filtres:hover {
  background-color: #5d6bc4;
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
}
.container-courses {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 24px;
  width: 1000px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  max-height: 500px;
}
</style>
