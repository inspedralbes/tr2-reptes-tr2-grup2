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
  background-color: #FFFFFF;
  border-radius: 20px;
  border-style: solid;
  border-color: #87878748;
  border-width: 2px;
  padding: 24px;
  width: 1000px;
  max-width: 1050px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  min-height: 370px;
}
</style>
