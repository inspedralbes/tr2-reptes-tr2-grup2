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
  font-size: 1.1rem;
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

/* RESPONSIVE PARA TABLETS (768px - 1024px) */
@media (max-width: 1024px) {
  b {
    padding-left: 20px;
    font-size: 1rem;
  }

  .lista-container {
    padding: 10px 20px;
    height: 280px;
  }

  .col-titulo {
    font-size: 13px;
    max-width: 130px;
    padding-left: 20px;
  }

  .col-info {
    max-width: 50px;
  }
}

/* RESPONSIVE PARA MÓVILES (hasta 768px) */
@media (max-width: 768px) {
  b {
    padding-left: 15px;
    padding-top: 15px;
    font-size: 1.1rem;
    font-weight: bold;
  }

  .lista-container {
    padding: 10px 15px;
    height: auto;
    max-height: 350px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  .fila-recordatori {
    height: auto;
    margin-bottom: 0;
    padding: 8px 0;
    min-height: 40px;
    justify-content: flex-start;
    overflow: hidden;
    max-width: 90%;
    width: 90%;
  }

  .col-titulo {
    font-size: 14px;
    max-width: none;
    padding-left: 15px;
    padding-right: 10px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .col-info {
    margin-left: 10px;
    max-width: none;
    font-size: 14px;
  }
}

/* RESPONSIVE PARA IPHONE Y MÓVILES PEQUEÑOS (hasta 480px) */
@media (max-width: 480px) {
  b {
    padding-left: 10px;
    padding-top: 10px;
    font-size: 1rem;
    font-weight: bold;
  }

  .lista-container {
    padding: 5px 10px;
    height: auto;
    max-height: 300px;
    overflow: hidden;
  }

  .fila-recordatori {
    height: 35px;
    margin-bottom: 5px;
    overflow: hidden;
    max-width: 85%;
    width: 85%;
  }

  .col-titulo {
    font-size: 13px;
    max-width: 100%;
    padding-left: 12px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .col-info {
    margin-left: -20px;
    max-width: 45px;
    font-size: 13px;
  }

  .info-item {
    font-size: 13px;
  }
}
</style>
