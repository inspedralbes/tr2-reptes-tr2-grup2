<script setup></script>
<template>
  <div id="navBar">
    <div id="btns">
      <NuxtLink
        to="/centro/paginaPrincipal-Profes"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive }"
      >
        <button @click="navigate">
          <img src="/img/navBarProfes/Home.png" alt="" />
        </button>
      </NuxtLink>

      <br />

      <NuxtLink
        to="/centro/paginaInscripcionsTalleres-Profes"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive }"
      >
        <button @click="navigate">
          <img src="/img/navBarProfes/clipboard.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/centro/paginaEstatInscripcionsTalleres-Profes"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive }"
      >
        <button @click="navigate">
          <img src="/img/navBarProfes/checkbox.png" alt="" />
        </button>
      </NuxtLink>
      <br />
      <NuxtLink
        to="/centro/paginaTallersFinalitzats-Profes"
        custom
        v-slot="{ navigate }"
        :class="{ 'btn-activo': isActive }"
      >
        <button @click="navigate">
          <img src="/img/navBarProfes/document-alt.png" alt="" />
        </button>
      </NuxtLink>
    </div>
  </div>
</template>
<style>
#navBar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  height: 470px;
  background-color: #3949ab;
  padding: 10px;
  border-radius: 20px;
  margin-top: 30px;
  margin-left: 30px;
}
#btns {
  margin-top: 10px;
}
#btns button {
  width: 50px;
  height: 50px;
  background-color: transparent; /* Fondo inicial transparente */
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background-color 0.3s ease, padding 0.3s ease, transform 0.3s ease;
}

#btns button img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

#btns button:hover,
.btn-activo {
  background-color: #5c6bc0;
  padding: 10px;
  transform: scale(1.1);
}
</style>
