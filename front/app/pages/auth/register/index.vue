<!-- TODO: 3. Comprobar fetches 4. redirect a inicio si es correcto, 5. redirect por rol-->

<template>
  <div>
    <h1>Register</h1>
    <label for="email">Email:</label>
    <input type="email" id="email" v-model="form.writtenEmail" required /><br />

    <label for="institucio">Selecciona la seva institució:</label>
    <select id="institucio" v-model="form.writtenSelectedInstitucio" required>
      <option value="" disabled>Selecciona una opció...</option>
      <option
        v-for="institut in institutsList"
        :key="institut.id"
        :value="institut.id"
      >
        {{ institut.nom }}
      </option>
      <option value="prueb">Hola</option></select
    ><br />

    <label for="rol">Selecciona la seva ocupació:</label>
    <select id="" v-model="form.writtenRole" required>
      <option value="">Selecciona una opció...</option>
      <option v-for="(role, index) in roleList" :key="index" :value="role">
        {{ role }}
      </option></select
    ><br />

    <label for="password">Contrasenya:</label>
    <input
      type="password"
      id="password"
      v-model="form.writtenPsswd"
      required
    /><br />

    <label for="passwordConfirm">Confrima la contrasenya:</label>
    <input
      type="password"
      id="passwordConfirm"
      v-model="form.writtenConfirmPsswd"
      required
    /><br />

    <button @click="sendRegister(form)">Registre</button>
  </div>
</template>

<script setup>
import { reactive, shallowRef, ref, onMounted } from "vue";

import { getIdAndNameInstitucions } from "../../../services/communicationManagerDatabase";
import { registerUser } from "../../../services/communicationManagerLogin";

// Data a recollir
const form = reactive({
  writtenEmail: "",
  writtenSelectedInstitucio: 0,
  writtenRole: "",
  writtenPsswd: "",
  writtenConfirmPsswd: "",
});

// Llista per dropdown de instituts
const institutsList = shallowRef(null);
const loading = ref(true);

const institutsListObtain = async () => {
  try {
    const answer = await getIdAndNameInstitucions(); //comprobar que funciona
    institutsList.value =
      answer === undefined ? ["No hi han institucions"] : answer; //comprovar si agafa undefined o null si es buit
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  institutsListObtain();
});

// LLista per dropdown de rol
const roleList = ["Admin", "Professorat", "Extern"];

// Funció per enviar el registre
const isSending = ref(false);
const sendRegister = async (sendingForm) => {
  isSending.value = true;
  try {
    console.log("sending form...");
    registerUser(
      sendingForm.writtenEmail,
      sendingForm.writtenPsswd,
      sendingForm.writtenRole,
      sendingForm.writtenSelectedInstitucio
    );
  } finally {
    isSending.value = false;
    console.log(JSON.stringify(sendingForm));
  }
};

// Funció per comparar contrasenyes || PENDENT D'IMPLEMENTAR
/*function compararContrasenyes(password, confirmPassword) {
  let cleanStr = (str) => str.replace(/^[0-9\s]*|[+*\r\n]/g, "");

  if (cleanStr(password).equals(cleanStr(confirmPassword))) {
    return true;
  }
  return false;
}*/
</script>
<style scooped></style>
