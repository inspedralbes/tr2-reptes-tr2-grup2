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
}

#contenido {
  margin-left: 50px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
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
  background-color: #f5f5f5;
  border-radius: 20px;
  padding-top: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  max-height: 250px;
  width: 100%;
}
</style>
