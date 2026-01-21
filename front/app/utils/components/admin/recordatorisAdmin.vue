<script setup>
import { ref } from "vue";
</script>
<template>
  <b>Recordatoris</b>
  <div class="lista-container">
    <!-- FILA (barra superior) -->
    <div class="fila-recordatori">
      <div class="col-titulo">
        <span class="texto-titulo">Peticions rebudes</span>
      </div>

      <div class="col-info">
        <span class="info-item"> X </span>
      </div>
    </div>
    <div class="fila-recordatori">
      <div class="col-titulo">
        <span class="texto-titulo">Tallers per assignar</span>
      </div>

      <div class="col-info">
        <span class="info-item"> 8 </span>
      </div>
    </div>
    <div class="fila-recordatori">
      <div class="col-titulo">
        <span class="texto-titulo">Tallers actius</span>
      </div>

      <div class="col-info">
        <span class="info-item"> 8 </span>
      </div>
    </div>
    <div class="fila-recordatori">
      <div class="col-titulo">
        <span class="texto-titulo">Checklists pendents</span>
      </div>

      <div class="col-info">
        <span class="info-item"> 8 </span>
      </div>
    </div>
  </div>
</template>
<style scoped>
b {
  display: block;
  padding-top: 20px;
  padding-left: 30px;
}

.lista-container {
  max-width: 100%;
  width: 100%;
  height: 300px;
  overflow-y: auto;
  overflow-x: visible;
  padding: 10px 30px;
  margin: 0 auto;
}

/* contenedor por item (fila + desplegable) */
.curso-item {
  position: relative;
  margin-bottom: 10px;
}

.fila-recordatori {
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  height: 45px;
  position: relative;
}

.col-titulo {
  background-color: #7986cb;
  font-size: 14px;
  color: #1a1a1a;
  z-index: 3;
  flex: 2;
  min-height: 30px;
  max-width: 150px;
  display: flex;
  align-items: center;
  padding-left: 25px;
  border-radius: 25px;
  font-weight: bold;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -50px;
  z-index: 2;
  flex: 1;
  min-height: 30px;
  max-width: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 15px;
  border-radius: 25px;
}
</style>
