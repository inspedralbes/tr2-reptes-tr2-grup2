<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarAdmin from "@/layouts/navBarAdmin.vue";
import llistaTallers from "@/utils/components/admin/listaTallersAdmin.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="body">
    <navBarAdmin />
    <div id="content">
      <div class="header-Tallers">
        <h1>Gestió tallers</h1>
      </div>
      <div class="container-courses">
        <br />
        <llistaTallers></llistaTallers>
      </div>
    </div>
  </div>
</template>
<style scoped>
#body {
  display: flex;
}
#content {
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
}

.header-Tallers {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
