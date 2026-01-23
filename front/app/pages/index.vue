<script setup>
</script>
<template>
  <div>
    <div id="cuerpo">
      <div id="contenidor">
        <div id="prim-menu">
          <h3>A quina area vols accedir?</h3>
          <br />
          <NuxtLink to="/admin/paginaPrincipal-Admin" custom v-slot="{ navigate }">
            <button @click="navigate">Personal Consorci</button>
          </NuxtLink>
          <br />
          <NuxtLink to="/centro/paginaPrincipal-Profes" custom v-slot="{ navigate }">
            <button @click="navigate">Personal del Centre</button>
          </NuxtLink>
          <br />
          <NuxtLink to="/forms/log-in" custom v-slot="{ navigate }">
            <button @click="navigate">Formulario Login</button>
          </NuxtLink>
          <br />
          <NuxtLink to="/forms/sign-in" custom v-slot="{ navigate }">
            <button @click="navigate">Formulario Registro</button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
#cuerpo {
  margin-top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

#contenidor {
  justify-content: center;
  text-align: center;
  background-color: #ffffff;
  box-shadow: 0px 0px 13px 3px #909090;
  margin: 20px;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  min-height: 300px;
}

#prim-menu {
  margin-top: 40px;
  font-family: Arial, Helvetica, sans-serif;
  color: #181818;
}

#prim-menu button {
  width: 90%;
  max-width: 250px;
  height: 60px;
  margin: 15px auto;
  padding: 10px 20px;
  font-size: 20px;
  border: none;
  border-radius: 10px;
  background-color: #1f0dca;
  color: white;
  transition: 0.3s;
  cursor: pointer;
  display: block;
}

#prim-menu button:hover {
  background-color: #0a047d;
}

/* Mobile */
@media (max-width: 480px) {
  #cuerpo {
    margin-top: 80px;
  }

  #contenidor {
    width: 95%;
    margin: 10px;
    padding: 15px;
  }

  #prim-menu h3 {
    font-size: 1.2rem;
  }

  #prim-menu button {
    font-size: 16px;
    height: 50px;
  }
}

/* Tablet */
@media (min-width: 481px) and (max-width: 768px) {
  #contenidor {
    width: 85%;
  }
}

/* Mobile: < 480px */
@media (max-width: 480px) {}

/* Tablet: 481px - 768px */
@media (min-width: 481px) and (max-width: 768px) {}

/* Desktop: > 769px */
@media (min-width: 769px) {}
</style>
