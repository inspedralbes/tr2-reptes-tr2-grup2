<script setup>
import Encabezado from "@/layouts/encabezado.vue";
</script>
<template>
  <Encabezado></Encabezado>
  <div id="cuerpo">
    <div id="contenidor">
      <div id="prim-menu">
        <h3>A quina area vols accedir?</h3>
        <br />
        <NuxtLink
          to="/admin/paginaPrincipal-Admin"
          custom
          v-slot="{ navigate }"
        >
          <button @click="navigate">Personal Consorci</button>
        </NuxtLink>

        <br />

        <NuxtLink
          to="/centro/paginaPrincipal-Profes"
          custom
          v-slot="{ navigate }"
        >
          <button @click="navigate">Personal del Centre</button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<style scoped>
#cuerpo {
  margin-top: 100px;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
}
#contenidor {
  justify-content: center;
  text-align: center;
  background-color: #ffffff;
  -webkit-box-shadow: 0px 0px 13px 3px #909090;
  box-shadow: 0px 0px 13px 3px #909090;
  margin: 20px;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  min-height: 300px;
}
#prim-menu {
  margin-top: 40px;
  font-family: Arial, Helvetica, sans-serif;
  color: #181818;
}
#prim-menu button {
  width: 250px;
  height: 60px;
  margin: 15px;
  padding: 10px 20px;
  font-size: 20px;
  border: none;
  border-radius: 5px;
  background-color: #1f0dca;
  color: white;
  border-radius: 10px;
  transition: 0.3s;
  cursor: pointer;
}
#prim-menu button:hover {
  background-color: #0a047d;
}
</style>
