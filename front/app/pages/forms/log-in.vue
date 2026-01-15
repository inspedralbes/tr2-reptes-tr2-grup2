<script setup>
import Encabezado from "@/layouts/encabezado.vue";

const input_email = ref("");
const input_pass = ref("");
</script>
<template>
  <Encabezado></Encabezado>
  <div id="cuerpo">
    <div id="contenidor">
      <div id="prim-menu">
        <h3>Indica les teves credencials:</h3>
        <br />
        <br />
        <input v-model="input_email" type="text" placeholder="Email" required />
        <br />
        <br />
        <input
          v-model="input_pass"
          type="text"
          placeholder="Contraseña"
          required
        />
        <br />
        <br />
        <a href="">He oblidat la meva contrasenya.</a>
        <br />
        <NuxtLink to="/forms/sign-in" custom v-slot="{ navigate }">
          <a href="/forms/sign-in">No tens compte? Dona't d'alta!</a>
        </NuxtLink>

        <br />
        <br />
        <button>Entrar</button>
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
  font-family: "Coolvetica";
  margin-top: 100px;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
}
#contenidor {
  justify-content: center;
  font-weight: lighter;
  text-align: center;
  background-color: #ffffff;
  -webkit-box-shadow: 0px 0px 13px 3px #909090;
  box-shadow: 0px 0px 13px 3px #909090;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  min-height: 350px;
}

input {
  width: 200px;
  height: 30px;
  background-color: #d0d0d0;
  padding-left: 20px;
  border-radius: 20px;
  border-color: transparent;
  font-size: large;
}

a {
  font-size: smaller;
}

button {
  width: 100px;
  height: 50px;
  font-size: large;
  border-color: transparent;
  border-radius: 15px;
  background-color: #1f0dca;
  color: white;
  transition: 0.3s;
  cursor: pointer;
}
button:hover {
  opacity: 0.8;
}
</style>
