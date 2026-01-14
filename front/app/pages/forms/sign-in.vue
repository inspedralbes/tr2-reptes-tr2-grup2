<script setup>
import Encabezado from "@/layouts/encabezado.vue"; 
const pantalla = ref('primero');
</script>

<template>
    <Encabezado></Encabezado> 
  <div id="cuerpo">
    <div id="contenidor">
      <h2>Registre del Centre</h2>
      <h4>Introdueix la següent informació:</h4>

      <div v-if="pantalla === 'primero'" id="prim-part">
        <h3>Informació del centre:</h3>
        
        <div class="form-group">
          <label for="sch-name">Nom del centre:*</label>
          <input id="sch-name" type="text">
        </div>

        <div class="form-group">
          <label for="sch-id">Identificador del centre:*</label>
          <input id="sch-id" type="text">
        </div>

        <div class="form-group">
          <label for="sch-map">Adreça: (Opcional)</label>
          <input id="sch-map" type="text">
        </div>

        <div class="button-container single-btn">
          <button @click="pantalla = 'segundo'">Següent</button>
        </div>
      </div>

      <div v-else-if="pantalla === 'segundo'" id="sec-part">
        <h3>Informació de la conte:</h3>

        <div class="form-group">
          <label>Nom:</label>
          <input type="text">
        </div>

        <div class="form-group">
          <label>Cognoms:</label>
          <input type="text">
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input type="email">
        </div>

        <div class="form-group">
          <label>Contrasenya:</label>
          <input type="password">
        </div>

        <div class="spacer"></div>

        <div class="form-group">
          <label>Valida la contrasenya:</label>
          <input type="password">
        </div>

        <div class="button-container">
          <button class="btn-back" @click="pantalla = 'primero'">Tornar</button>
          <button class="btn-next">Registrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "Coolvetica";
  src: url(/assets/fuentes/coolvetica/Coolvetica\ Rg.otf);
}

#cuerpo {
  font-family: "Coolvetica", sans-serif;
  margin-top: 5%;
  display: flex;
  justify-content: center;
}

#contenidor {
  background-color: #ffffff;
  box-shadow: 0px 0px 13px 3px #909090;
  padding: 10px;
  padding-left: 40px;
   padding-right: 40px;
  border-radius: 15px;
  width: 700px; 
}

h2 { margin-bottom: 5px; }
h4 { margin-bottom: 25px; color: #555; font-weight: normal; }

#prim-part, #sec-part {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  text-align: left;
  margin-top: -30px;
}

h3 {
  grid-column: span 2;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 8px;
}

input {
  padding: 12px 20px;
  border-radius: 25px;
  border: 1px solid #ccc;
  outline: none;
}

.spacer {
  display: block;
}


.button-container {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end; 
  gap: 20px;
  margin-top: -10px;
}

button {
  width: 130px;
  height: 45px;
  border-radius: 50px;
  background-color: #1F0DCA;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.btn-back {
  background-color: #e0e0e0;
  color: #333;
}

button:hover {
  opacity: 0.8;
}
</style>