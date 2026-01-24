<script setup>
import institucions from "@/utils/components/admin/centresAdmin.vue";
</script>
<template>
  <div class="page-container">
    <div id="cuerpo">
      <div id="contenido">
        <div class="header-Centres">
          <h2>Informació centres</h2>
        </div>
        <br />
        <institucions></institucions>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page-container {
  width: 100%;
  flex: 1;
}

#cuerpo {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 100px);
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

#contenido {

  margin-left: 4%;
  margin-right: auto;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
  width: 95%;
  max-width: 1400px;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
}

.header-Centres {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.header-Centres h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}
</style>
