<script setup>
import { ref } from "vue";
import Encabezado from "@/layouts/encabezado.vue";
import { registerUsuari } from "~/services/communicationManagerDatabase";
import Swal from "sweetalert2";
const pantalla = ref("primero");

//Variables para formulario del centre
const input_sch_name = ref("");
const input_sch_id = ref("");
const input_sch_map = ref("");
const input_sch_cp = ref("");
//Variables para formulario persona de contacte
const input_name = ref("");
const input_surname = ref("");
const input_email = ref("");
const input_pass = ref("");
const input_confirm_pass = ref("");

function reviewForm1() {
  if (!input_sch_name.value || !input_sch_id.value) {
    Swal.fire({
      icon: "warning",
      title: "Atenció",
      text: "Si us plau, omple tots els camps obligatoris.",
      confirmButtonText: "Tancar",
    });
    return;
  }
  pantalla.value = "segundo";
}

async function reviewForm2() {
  const camposCompletos =
    input_name.value &&
    input_surname.value &&
    input_email.value &&
    input_pass.value &&
    input_confirm_pass.value;

  if (!camposCompletos) {
    Swal.fire({
      icon: "warning",
      title: "Atenció",
      text: "Si us plau, omple tots els camps.",
      confirmButtonText: "Tancar",
    });

    return;
  }

  if (input_pass.value !== input_confirm_pass.value) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Les contrasenyes no coincideixen.",
    });

    return;
  }
  await sendForm();
}

//Función para enviar la info del usuario al backend después de validar el formulario
async function sendForm() {
  const datosParaEnviar = {
    nom: `${input_name.value} ${input_surname.value}`,
    email: input_email.value,
    password: input_pass.value,
    rol: "Professorat",
    responsable: {
      nom: input_sch_name.value,
      codi_centre: input_sch_id.value,
      direccio: input_sch_map.value,
      codi_postal: input_sch_cp.value,
    },
  };

  try {
    const data = await registerUsuari(datosParaEnviar);
    pantalla.value = "finalitzat";
  } catch (error) {
    console.error("Error detallat:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      html: "No s'ha pogut fer el registre <br>" + error.message,
      confirmButtonText: "Tancar",
    });
  }
}
</script>

<template>
  <div id="cuerpo">
    <div id="contenidor">
      <h2>Registre del Centre</h2>
      <h4 v-if="(pantalla === 'primero') | 'segundo'">
        Introdueix la següent informació:
      </h4>

      <div v-if="pantalla === 'primero'" id="prim-part">
        <h3>Informació del centre:</h3>

        <div class="form-group">
          <label for="sch-name">Nom del centre:*</label>
          <input v-model="input_sch_name" id="sch-name" type="text" />
        </div>

        <div class="form-group">
          <label for="sch-id">Identificador del centre:*</label>
          <input v-model="input_sch_id" id="sch-id" type="text" />
        </div>

        <div class="form-group">
          <label for="sch-map">Adreça: (Opcional)</label>
          <input v-model="input_sch_map" id="sch-map" type="text" />
        </div>

        <div class="form-group">
          <label for="sch-map">Codi Postal: (Opcional)</label>
          <input v-model="input_sch_cp" id="sch-cp" type="text" />
        </div>

        <div class="button-container single-btn">
          <button @click="reviewForm1">Següent</button>
        </div>
      </div>

      <div v-else-if="pantalla === 'segundo'" id="sec-part">
        <h3>Informació de la conte:</h3>

        <div class="form-group">
          <label>Nom:</label>
          <input v-model="input_name" type="text" />
        </div>

        <div class="form-group">
          <label>Cognoms:</label>
          <input v-model="input_surname" type="text" />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="input_email" type="email" />
        </div>

        <div class="form-group">
          <label>Contrasenya:</label>
          <input v-model="input_pass" type="password" />
        </div>

        <div class="spacer"></div>

        <div class="form-group">
          <label>Valida la contrasenya:</label>
          <input v-model="input_confirm_pass" type="password" />
        </div>

        <div class="button-container">
          <button class="btn-back" @click="pantalla = 'primero'">Tornar</button>
          <button class="btn-next" @click="reviewForm2">Registrar</button>
        </div>
      </div>
      <div v-else-if="pantalla === 'finalitzat'">
        <h3>Gràcies per omplir la sol·licitut</h3>
        <p>Quan l'administrador gestioni la sol·licitut podràs accedir.</p>
      </div>
      <div v-else-if="pantalla === 'error'">
        <h3>Ha succeit un problema amb la sol·licitut</h3>
        <p>Si us plau, torna a omplir-la amb valors correctes</p>
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
  background-color: #ffffff;
  box-shadow: 0px 0px 13px 3px #909090;
  padding: 10px;
  padding-left: 40px;
  padding-right: 40px;
  border-radius: 15px;
  width: 700px;
}

h2 {
  margin-bottom: 5px;
}

h4 {
  margin-bottom: 25px;
  color: #555;
  font-weight: normal;
}

#prim-part,
#sec-part {
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
  background-color: #1f0dca;
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
