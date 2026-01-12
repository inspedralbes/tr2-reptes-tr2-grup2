<script setup>
import Encabezado from "@/layouts/encabezado.vue";
import navBarAdmin from "@/layouts/navBarAdmin.vue";
import graficaTallers from "@/utils/components/admin/graficaTallers.vue";
import graficaInstitucions from "@/utils/components/admin/graficaInstitucions.vue";
import calendari from "@/utils/components/admin/calendari.vue"

</script>
<template>
  <Encabezado />
  <div id="cuerpo">
    <navBarAdmin />
    <div id="contenido">
      <h2>Bon día, <span id="user">*AdminName*</span>:</h2>
      <div class="panell-admin">
        <div class="tarjetas-admin">
          <p>PPPP</p>
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
</template>
<style scoped>
#cuerpo {
  display: flex;
}

#contenido {
  margin-top: 50px;
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
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

/* Estilització de les targetes, canviar amb el style de Valeria/Alba */
.tarjetas-admin {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 600px;
  max-height: 500px;
}
</style>