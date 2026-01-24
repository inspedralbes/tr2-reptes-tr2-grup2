<script setup>
import listaFinalizados from "@/utils/components/centro/listaFinalizados.vue";
</script>
<template>
  <div class="page-container">
    <div id="cuerpo">
      <div id="contenido">
        <h3>Tallers finalitzats:</h3>
        <div id="list-wrapper">
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

@media (max-width: 768px) {
  #cuerpo {
    min-height: calc(100vh - 60px);
    align-items: flex-start;
  }

  #contenido {
    width: 95%;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: auto;
  }
}
</style>
