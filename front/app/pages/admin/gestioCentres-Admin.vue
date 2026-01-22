<script setup>
import institucions from "@/utils/components/admin/centresAdmin.vue";
</script>
<template>
  <div>
    <div id="body">
      <div id="content">
        <div class="header-Centres">
          <h2>Informació centres</h2>
        </div>
        <div class="container-courses">
          <br />
          <institucions></institucions>
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

.header-Centres {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-filtres {
  background-color: #7986cb;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 22px;
  border: 2px solid #3949ab70;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-filtres:hover {
  background-color: #aab4e9;
  border: 2px solid #5064cd70;
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
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
