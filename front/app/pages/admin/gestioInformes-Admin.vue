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
  height: 100vh;
  overflow: hidden;
}

#content {
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

#content::-webkit-scrollbar {
  width: 6px;
}

#content::-webkit-scrollbar-track {
  background: transparent;
}

#content::-webkit-scrollbar-thumb {
  background: #878787;
  border-radius: 10px;
}
</style>
