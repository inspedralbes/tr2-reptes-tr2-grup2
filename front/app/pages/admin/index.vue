<script setup>
import graficaTallers from "@/utils/components/admin/graficaTallers.vue";
import graficaInstitucions from "@/utils/components/admin/graficaInstitucions.vue";
import calendari from "@/utils/components/admin/calendari.vue";
import recordatorisAdmin from "@/utils/components/admin/recordatorisAdmin.vue";
import { onMounted, ref } from "vue";
const userName = ref("*AdminName*");
onMounted(() => {
  if (typeof window !== "undefined") {
    userName.value = localStorage.getItem("user_name") || "*AdminName*";
  }
});
</script>
<template>
  <div class="page-container">
    <div id="cuerpo">
      <h2 class="welcome-header">Bon dia, <span id="user">{{ userName }}</span>:</h2>
      <div id="contenido">
        <div class="panell-admin">
          <div class="tarjetas-admin">
            <recordatorisAdmin />
          </div>
          <div class="tarjetas-admin">
            <graficaTallers />
          </div>
          <div class="tarjetas-admin">
            <calendari />
          </div>
          <div class="tarjetas-admin">
            <graficaInstitucions />
          </div>
        </div>
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

.welcome-header {
  margin-left: 4%;
  width: 95%;
  max-width: 1400px;
  margin-top: 3%;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 2rem;
  text-align: left;
  align-self: center;
  font-weight: bold;
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

#user {
  color: #5c6bc0;
  font-weight: bold;
}



/* Estilització de les targetes */
.tarjetas-admin {
  background-color: #FFFFFF;
  border-radius: 20px;
  border: 2px solid #87878748;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  min-height: 250px;
  height: auto;
  width: 95%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tarjetas-admin:nth-child(1) :deep(.lista-container) {
  height: auto !important;
  max-height: 220px;
}

.panell-admin {
  display: grid;
  grid-template-columns: minmax(280px, 320px) 1fr;
  gap: 10px 40px;
  width: 100%;
  grid-auto-rows: min-content;

}
</style>
