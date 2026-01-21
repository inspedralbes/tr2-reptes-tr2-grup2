<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarAdmin from "@/layouts/navBarAdmin.vue";
import informes from "@/utils/components/admin/informesAdmin.vue";
</script>

<template>
  <Encabezado />
  <div id="body">
    <navBarAdmin />
    <div id="content">
      <informes></informes>
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
</style>
