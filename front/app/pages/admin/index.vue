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
  <div>
    <div id="cuerpo">
      <div id="contenido">
        <h2>Bon día, <span id="user">{{ userName }}</span>:</h2>
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
  width: 100%;
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

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
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

/* RESPONSIVE PARA TABLETS (768px - 1024px) */
@media (max-width: 1024px) {
  #contenido {
    margin-left: 30px;
    padding-right: 15px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .panell-admin {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .tarjetas-admin {
    max-height: 300px;
  }
}

/* RESPONSIVE PARA MÓVILES (hasta 768px) */
@media (max-width: 768px) {
  #cuerpo {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  #contenido {
    margin-left: 0;
    margin-right: 0;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 20px;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  h2 {
    font-size: 1.6rem;
    margin-bottom: 15px;
    width: 100%;
  }

  .panell-admin {
    grid-template-columns: 1fr;
    gap: 20px;
    width: 100%;
    max-width: 100%;
  }

  .tarjetas-admin {
    max-height: none;
    min-height: 280px;
    width: 100%;
    overflow: hidden;
  }
}

/* RESPONSIVE PARA IPHONE Y MÓVILES PEQUEÑOS (hasta 480px) */
@media (max-width: 480px) {
  #cuerpo {
    overflow: visible;
  }

  #contenido {
    margin-left: 0;
    margin-right: 0;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 8px;
    padding-bottom: 15px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-x: hidden;
  }

  h2 {
    font-size: 1.4rem;
    margin-bottom: 12px;
    width: 100%;
  }

  .panell-admin {
    gap: 15px;
    width: 100%;
  }

  .tarjetas-admin {
    min-height: 250px;
    border-width: 1px;
    padding-top: 10px;
    width: 100%;
    overflow: hidden;
  }
}
</style>
