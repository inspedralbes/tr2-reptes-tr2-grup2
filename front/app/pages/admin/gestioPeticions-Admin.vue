<script setup>
import listaPeticions from "@/utils/components/admin/peticionsAdmin.vue";
</script>
<template>
  <div>
    <div id="body">
      <div id="content">
        <div class="header-Peticions">
          <h2>Gestió peticions</h2>
        </div>
        <div class="container-courses">
          <br />
          <listaPeticions></listaPeticions>
        </div>
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

.container-courses {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 24px;
  width: 1050px;
  max-width: 1050px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  max-height: 550px;
}
</style>
