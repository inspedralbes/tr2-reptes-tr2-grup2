<script setup>
import graficaTallers from "@/utils/components/admin/graficaTallers.vue";
import graficaInstitucions from "@/utils/components/admin/graficaInstitucions.vue";
import calendari from "@/utils/components/admin/calendari.vue";
import recordatorisAdmin from "@/utils/components/admin/recordatorisAdmin.vue";
</script>
<template>
  <div>
    <div id="cuerpo">
      <div id="contenido">
        <h2>Bon día, <span id="user">*AdminName*</span>:</h2>
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
#cuerpo {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

#contenido {
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 20px;
}

#contenido::-webkit-scrollbar {
  width: 6px;
}

#contenido::-webkit-scrollbar-track {
  background: transparent;
}

#contenido::-webkit-scrollbar-thumb {
  background: #878787;
  border-radius: 10px;
}

#user {
  color: #5c6bc0;
  font-weight: bold;
}

.panell-admin {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(520px, 1fr);
  gap: 40px;
  align-items: start;
}

/* Estilització de les targetes, canviar amb el style de Valeria/Alba */
.tarjetas-admin {
  background-color: #FFFFFF;
  border-radius: 20px;
  border-style: solid;
  border-color: #87878748;
  border-width: 2px;
  padding-top: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  max-height: 250px;
  width: 100%;
}
</style>
