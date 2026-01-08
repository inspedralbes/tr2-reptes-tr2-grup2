<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarProfes from "@/layouts/navBarProfes.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="body">
    <navBarProfes></navBarProfes>
    <div id="content">
      <div class="header-Centres">
        <h2>Gestió informes</h2>
      </div>
      <div class="container-informs">
        <br />
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

.container-informs {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 24px;
  width: 1000px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  max-height: 500px;
  height: 400px;
}
</style>
