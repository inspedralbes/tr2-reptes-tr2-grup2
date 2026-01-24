<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import Encabezado from "@/layouts/encabezado.vue";
import { loginUsuari } from "~/services/communicationManagerDatabase";

// Variables reactivas para el formulario
const input_email = ref("");
const input_pass = ref("");
const cargando = ref(false);

// Función para gestionar el inicio de sesión mandandolo al backend para que funcione
async function handleLogin() {
  if (cargando.value) return;
  if (!input_email.value || !input_pass.value) {
    Swal.fire({
      icon: "error",
      title: "Login incomplet",
      text: "Omple el formulari amb el teu email i contrasenya.",
      confirmButtonText: "Tornar-hi",
    });
    return;
  }

  cargando.value = true;

  try {
    const response = await loginUsuari({
      email: input_email.value,
      password: input_pass.value,
    });

    const data = response.user;

    if (response) {
      localStorage.setItem("user_id", data.id);
      localStorage.setItem("user_email", data.email);
      localStorage.setItem("user_institution_id", data.institucio || "");
      localStorage.setItem("user_role", data.rol);
      Swal.fire({
        icon: "success",
        title: "Éxit",
        text: "Login correcte",
        confirmButtonText: "Accedir",
      });
      navigateTo(setPath(data.rol));
    } else {
      Swal.fire({
        icon: "error",
        title: "Credencials incorrectes",
        text: "Revisa el teu email i contrasenya." || data.error,
        confirmButtonText: "Tornar-hi",
      });
    }
  } catch (error) {
    console.error("Error en la conexión:", error);
    Swal.fire({
      icon: "error",
      title: "Problemes amb el servidor",
      text: error.message,
      confirmButtonText: "Tornar-hi",
    });
  } finally {
    cargando.value = false;
  }
}

function setPath(rol) {
  if (rol === "Admin") return "../admin";
  if (rol === "Professorat") return "../centro";
}
</script>

<template>
  <div id="cuerpo">
    <div id="contenidor">
      <div id="prim-menu">
        <h3>Indica les teves credencials:</h3>
        <br />

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input
              v-model="input_email"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <br />
          <div class="form-group">
            <input
              v-model="input_pass"
              type="password"
              placeholder="Contrasenya"
              required
            />
          </div>
          <br />

          <a href="#" class="link-small">He oblidat la meva contrasenya.</a>
          <br />

          <NuxtLink to="/sign-in" class="link-small">
            No tens compte? Dona't d'alta!
          </NuxtLink>

          <br /><br />

          <button type="submit" :disabled="cargando">
            {{ cargando ? "Entrant..." : "Entrar" }}
          </button>
        </form>
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 22%;
}

#contenidor {
  font-weight: lighter;
  text-align: center;
  background-color: #ffffff;
  box-shadow: 0px 0px 13px 3px #909090;
  padding: 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 450px;
}

h3 {
  margin-bottom: 10px;
}

input {
  width: 80%;
  height: 40px;
  background-color: #f0f0f0;
  padding: 0 20px;
  border-radius: 25px;
  border: 1px solid transparent;
  font-size: 1rem;
  outline: none;
  transition: border 0.3s;
}

input:focus {
  border: 1px solid #1f0dca;
}

.link-small {
  font-size: 0.85rem;
  color: #555;
  text-decoration: none;
  display: inline-block;
  margin-top: 10px;
}

.link-small:hover {
  text-decoration: underline;
  color: #1f0dca;
}

button {
  width: 150px;
  height: 50px;
  font-size: 1.1rem;
  border: none;
  border-radius: 25px;
  background-color: #1f0dca;
  color: white;
  font-weight: bold;
  transition: 0.3s;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
