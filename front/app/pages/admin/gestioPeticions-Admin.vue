<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarProfes from "@/layouts/navBarProfes.vue";
import peticionsAdmin from "@/utils/components/admin/peticionsAdmin.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="body">
    <navBarProfes></navBarProfes>
    <div id="content">
      <div class="header-Peticions">
        <h2>Gestió peticions</h2>
      </div>
      <div class="container-courses">
        <!-- <button class="btn-peticions">Centres</button>
        <button class="btn-peticions">Tallers</button> -->
        <br />
        <peticionsAdmin></peticionsAdmin>
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
/* .header-Peticions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
} */
.container-courses {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 24px;
  width: 1050px;
  max-width: 1050px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  max-height: 500px;
}
</style>
