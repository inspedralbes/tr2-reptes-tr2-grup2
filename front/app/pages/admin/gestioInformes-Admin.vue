<script setup>
import informes from "@/utils/components/admin/informesAdmin.vue";
</script>

<template>
  <div>
    <div id="body">
      <div id="content">
        <informes></informes>
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
</style>
