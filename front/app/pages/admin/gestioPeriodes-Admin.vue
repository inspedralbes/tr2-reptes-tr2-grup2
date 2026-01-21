<script setup>
import { ref, computed } from "vue";
import Encabezado from "@/layouts/encabezado.vue";
import navBarAdmin from "@/layouts/navBarAdmin.vue";
import calendari from "@/utils/components/admin/calendari.vue";

// --- DATOS ESTÁTICOS ---
const periodosAnteriores = ref([
  {
    id: 1,
    fechaIni: "2024-01-10",
    fechaFin: "2024-01-20",
    hora: "09:00",
    tipo: "Primer",
  },
  {
    id: 2,
    fechaIni: "2024-02-05",
    fechaFin: "2024-02-15",
    hora: "10:00",
    tipo: "Segon",
  },
  {
    id: 3,
    fechaIni: "2024-03-01",
    fechaFin: "2024-03-10",
    hora: "08:30",
    tipo: "Primer",
  },
]);

// --- ESTADOS ---
const selectedPeriodId = ref(null);
const showModal = ref(false);

const formNuevaFecha = ref({
  fecha: "",
  hora: "",
  tipo: "Primer",
});

// --- COMPUTED ---
const selectedPeriod = computed(() =>
  periodosAnteriores.value.find((p) => p.id === selectedPeriodId.value),
);

const isSelectionActive = computed(() => selectedPeriodId.value !== null);

// --- FUNCIONES ---
const selectPeriod = (id) => {
  selectedPeriodId.value = selectedPeriodId.value === id ? null : id;
};

const openModal = () => {
  formNuevaFecha.value = { fecha: "", hora: "", tipo: "Primer" };
  showModal.value = true;
};

const handleCreate = () => {
  alert(
    `Nou període creat: ${formNuevaFecha.value.fecha} a les ${formNuevaFecha.value.hora} (${formNuevaFecha.value.tipo})`,
  );
  showModal.value = false;
};

const handleApply = () => {
  if (selectedPeriod.value) {
    alert(`Període ${selectedPeriod.value.id} aplicat.`);
  }
};

const handleEdit = () => {
  if (selectedPeriod.value) {
    alert(`Editant període ${selectedPeriod.value.id}.`);
  }
};
</script>

<template>
  <Encabezado />
  <div id="body">
    <navBarAdmin />
    <div id="content">
      <div class="header-periodes">
        <h2>Gestió Periodes</h2>
      </div>

      <div id="container-main">
        <div class="columns-wrapper">
          <!-- Columna Calendario -->
          <div class="column-left">
            <div class="card calendar-card">
              <h3>Calendari</h3>
              <!-- Placeholder para el calendario -->
              <div class="calendar-placeholder">
                <calendari />
              </div>
            </div>
          </div>

          <!-- Columna Lista -->
          <div class="column-right">
            <div class="card list-card">
              <h3>Períodes Anteriors</h3>
              <div class="period-list">
                <div
                  v-for="p in periodosAnteriores"
                  :key="p.id"
                  class="period-item"
                  :class="{ 'is-selected': selectedPeriodId === p.id }"
                  @click="selectPeriod(p.id)"
                >
                  <div class="period-info">
                    <span class="period-dates"
                      >{{ p.fechaIni }} - {{ p.fechaFin }}</span
                    >
                    <span class="period-type-badge">{{ p.tipo }}</span>
                  </div>
                  <span class="period-time">{{ p.hora }}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="actions-footer">
          <button
            @click="handleApply"
            :disabled="!isSelectionActive"
            class="btn-action apply"
          >
            Aplicar
          </button>
          <button
            @click="handleEdit"
            :disabled="!isSelectionActive"
            class="btn-action edit"
          >
            Editar
          </button>
          <button @click="openModal" class="btn-action add">Nova Data</button>
        </div>
      </div>
    </div>

    <!-- Modal Nova Data -->
    <Teleport to="body" v-if="showModal">
      <div class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <h3>Nova Data de Període</h3>
          <form @submit.prevent="handleCreate">
            <div class="form-group">
              <label>Data</label>
              <input type="date" v-model="formNuevaFecha.fecha" required />
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input type="time" v-model="formNuevaFecha.hora" required />
            </div>
            <div class="form-group">
              <label>Període</label>
              <div class="radio-group">
                <label>
                  <input
                    type="radio"
                    value="Primer"
                    v-model="formNuevaFecha.tipo"
                  />
                  Primer
                </label>
                <label>
                  <input
                    type="radio"
                    value="Segon"
                    v-model="formNuevaFecha.tipo"
                  />
                  Segon
                </label>
              </div>
            </div>
            <div class="modal-buttons">
              <button
                type="button"
                @click="showModal = false"
                class="btn-cancel"
              >
                Cancel·lar
              </button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "Coolvetica";
  src: url(/assets/fuentes/coolvetica/Coolvetica\ Rg.otf);
}
#body {
  display: flex;
  background-color: #f9f9f9;
  height: 100%;
  overflow: hidden;
  font-family: "Coolvetica";
}

#content {
  flex: 1;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
}

.header-periodes h2 {
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 15px;
}

#container-main {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 1050px;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.columns-wrapper {
  display: flex;
  gap: 30px;
  flex: 1;
  min-height: 0;
}

.column-left,
.column-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card {
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 15px;
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #3949ab;
  border-bottom: 1px solid #7987cb41;
  padding-bottom: 5px;
}

.calendar-placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.period-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 5px;
}

.period-item {
  background-color: #c5cae9;
  padding: 12px 15px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.3s;
}

.period-item:hover {
  background: #9fa8da;
}

.period-item.is-selected {
  border-color: #7986cb;
  background: #9fa8da;
}

.period-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.period-dates {
  font-weight: bold;
  font-size: 14px;
}

.period-type-badge {
  font-size: 11px;
  background: #4c5896;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}

.period-time {
  font-size: 13px;
  color: #666;
}

/* Acciones Footer */
.actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.btn-action {
  padding: 10px 25px;
  border-radius: 20px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action.apply {
  background: #aecaaf;
  border: 2px solid #8da88d;
}

.btn-action.edit {
  background: #ffba94;
  border: 2px solid #d39d80;
}

.btn-action.add {
  background: #7986cb;
  color: white;
}

.btn-action:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.modal-overlay {
  font-family: "Coolvetica";
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #3949ab;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
  font-size: 14px;
}

.form-group input {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.radio-group {
  display: flex;
  gap: 20px;
  padding: 5px 0;
}

.radio-group label {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.btn-cancel {
  padding: 8px 15px;
  border-radius: 15px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.btn-save {
  padding: 8px 20px;
  border-radius: 15px;
  border: none;
  background: #3949ab;
  color: white;
  cursor: pointer;
}
</style>
