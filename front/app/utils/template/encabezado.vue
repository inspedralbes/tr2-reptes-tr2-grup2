<script setup></script>
<template>
  <header>
    <img
      src="/assets/img/encabezado/consorci-logo.png"
      alt="Logo Consorci"
      id="logo-img"
    />
    <img
      src="/assets/img/encabezado/consorci-nombre.png"
      alt="Nombre Consorci"
      id="nombre-img"
    />
  </header>
</template>
<style scoped>
#logo-img {
  height: 60px;
  margin-left: 30px;
  margin-top: 10px;
}
#nombre-img {
  margin-top: 30px;
  height: 30px;
  margin-left: 15px;
}
header {
  width: 100%;
  height: 85px;
  background-color: #283593;
  display: flex;
  align-items: left;
  justify-content: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
