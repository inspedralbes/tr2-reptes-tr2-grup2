<script setup>
import { ref } from "vue";
import Encabezado from "@/layouts/encabezado.vue";

// Variables reactivas para el formulario
const input_email = ref("");
const input_pass = ref("");
const cargando = ref(false);

// Función para gestionar el inicio de sesión mandandolo al backend para que funcione
async function handleLogin() {
  if (cargando.value) return;
  if (!input_email.value || !input_pass.value) {
    alert("Si us plau, introdueix el teu email i la contrasenya.");
    return;
  }

  cargando.value = true;

  try {
    const response = await fetch(`${BACK_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input_email.value,
        password: input_pass.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Login correcto:", data);
      alert("Login exitós! Benvingut/da.");
      localStorage.setItem("auth_token", data.accessToken);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("user_email", data.user.email);
      localStorage.setItem("user_institution_id", data.user.institucio || "");
      localStorage.setItem("user_rol", data.user.rol);
      // navigateTo('/dashboard');
      alert(
        data.message ||
          "Login completat correctament"
      );
    } else {
      alert(
        data.error ||
          "Credencials incorrectes. Revisa el teu email i contrasenya."
      );
    }
  } catch (error) {
    console.error("Error en la conexión:", error);
    alert("No s'ha pogut connectar amb el servidor. Intenta-ho més tard.");
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <Encabezado></Encabezado>
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

          <NuxtLink to="/forms/sign-in" class="link-small">
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
  margin-top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
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
