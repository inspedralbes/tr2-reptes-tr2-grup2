<script setup>
import { ref, reactive } from "vue";
import Swal from "sweetalert2";

/* UI: abrir/cerrar panel filtros */
const showFilters = ref(false);

/* Estructura de filtros (placeholder) */
const filters = reactive({
  taller: "Tots",
  centre: "Tots",
  modalitat: "Totes",
  dateFrom: "",
  dateTo: "",
});

/* Acciones (solo estructura) */
function toggleFilters() {
  showFilters.value = !showFilters.value;
}

function applyFilters() {
  // Aqui luego harás: fetch / recompute informes con estos filtros
  showFilters.value = false;
}

function cancelFilters() {
  showFilters.value = false;
}

function clearFilters() {
  filters.taller = "Tots";
  filters.centre = "Tots";
  filters.modalitat = "Totes";
  filters.dateFrom = "";
  filters.dateTo = "";
}

/* Exportación (solo estructura) */
function exportPDF() {
  // Lógica para exportar a PDF
  Swal.fire({
    title: "Exportar a PDF",
    text: "Funcionalidad no implementada",
    confirmButtonText: "Tancar",
  });
}

function exportCSV() {
  // Lógica para exportar a CSV
  Swal.fire({
    title: "Exportar a CSV",
    text: "Funcionalidad no implementada",
    confirmButtonText: "Tancar",
  });
}
</script>

<template>
  <div class="header-Centres">
    <h2>Gestió informes</h2>
    <button id="btn-filtres" @click="toggleFilters">Filtres</button>
  </div>
  <div id="container">
    <div class="container-informs">
      <!-- PANEL FLOTANTE DE FILTROS -->
      <div
        v-if="showFilters"
        class="filters-overlay"
        @click.self="cancelFilters"
      >
        <div class="filters-pop">
          <div class="filters-head">
            <h3>Filtres</h3>
            <button class="btn-close" @click="cancelFilters">✕</button>
          </div>

          <div class="filters-grid">
            <div class="field">
              <label>Taller</label>
              <select v-model="filters.taller">
                <option>Tots</option>
                <option>Curs de Vela</option>
                <option>Curs de Teatre</option>
              </select>
            </div>

            <div class="field">
              <label>Centre educatiu</label>
              <select v-model="filters.centre">
                <option>Tots</option>
                <option>Institut X</option>
                <option>Escola Y</option>
              </select>
            </div>

            <div class="field">
              <label>Modalitat</label>
              <div class="segmented">
                <button
                  class="seg"
                  :class="{ active: filters.modalitat === 'Totes' }"
                  @click="filters.modalitat = 'Totes'"
                  type="button"
                >
                  Totes
                </button>
                <button
                  class="seg"
                  :class="{ active: filters.modalitat === 'A' }"
                  @click="filters.modalitat = 'A'"
                  type="button"
                >
                  A
                </button>
                <button
                  class="seg"
                  :class="{ active: filters.modalitat === 'B' }"
                  @click="filters.modalitat = 'B'"
                  type="button"
                >
                  B
                </button>
                <button
                  class="seg"
                  :class="{ active: filters.modalitat === 'C' }"
                  @click="filters.modalitat = 'C'"
                  type="button"
                >
                  C
                </button>
              </div>
            </div>

            <div class="field">
              <label>Dates</label>
              <div class="dates">
                <input type="date" v-model="filters.dateFrom" />
                <span class="dash">—</span>
                <input type="date" v-model="filters.dateTo" />
              </div>
            </div>
          </div>

          <div class="filters-actions">
            <button class="btn-ghost" @click="clearFilters" type="button">
              Netejar
            </button>
            <button class="btn-ghost" @click="cancelFilters" type="button">
              Cancel·lar
            </button>
            <button class="btn-primary" @click="applyFilters" type="button">
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <!-- AQUÍ IRÍAN LOS INFORMES (solo estructura visual) -->
      <div class="reports-grid">
        <div class="card">
          <div class="card-title">Tallers sol·licitats vs assignats</div>
          <div class="chart-placeholder">Gràfic (placeholder)</div>
        </div>

        <div class="card">
          <div class="card-title">Estadístiques de participació</div>
          <div class="chart-placeholder">Gràfic (placeholder)</div>
        </div>

        <div class="card">
          <div class="card-title">Estat dels checklists</div>
          <div class="chart-placeholder">Gràfic (placeholder)</div>
        </div>

        <div class="card">
          <div class="card-title">Satisfacció general</div>
          <div class="chart-placeholder">Mitjanes (placeholder)</div>
        </div>
      </div>

      <div class="card card-wide">
        <div class="card-title">Comparatives entre edicions o períodes</div>
        <div class="chart-placeholder wide">Comparativa (placeholder)</div>
      </div>

      <!-- EXPORTACIÓN -->
      <div class="export-section">
        <span class="export-label">Exportar informes:</span>
        <button class="btn-export" @click="exportPDF">PDF</button>
        <button class="btn-export secondary" @click="exportCSV">CSV</button>
      </div>

      <!-- mini texto para confirmar filtros aplicados -->
      <p class="filters-summary">
        Filtres aplicats:
        <strong>{{ filters.taller }}</strong> ·
        <strong>{{ filters.centre }}</strong> ·
        <strong>{{ filters.modalitat }}</strong>
      </p>
    </div>
  </div>
</template>

<style scoped>
#body {
  display: flex;
}

#container {
  background-color: #ffffff;
  /* border-radius: 20px; */
  padding: 24px;
  width: 1050px;
  max-width: 1050px;
  margin: 0 auto;
  /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); */
  overflow-y: auto;
  max-height: 550px;
}

.header-Centres {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 1050px;
  max-width: 1050px;
  /* margin: 20px auto 12px auto; */
}

/* .container-informs {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 24px;
  width: 1100px;
  max-width: 1100px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  max-height: 500px;
  height: 400px;
} */

#btn-filtres {
  background-color: #7986cb;
  color: #1f1f1f;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 22px;
  border: 2px solid #3949ab70;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
#btn-filtres:hover {
  background-color: #aab4e9;
  transform: translateY(-1px);
  border: 2px solid #5064cd70;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
}

/* OVERLAY + POPUP */
.filters-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 130px; /* para que no tape el header */
  z-index: 2000;
}

.filters-pop {
  width: 720px;
  max-width: 92vw;
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 18px 16px 18px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.filters-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.filters-head h3 {
  margin: 0;
  font-size: 18px;
}
.btn-close {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
}
.btn-close:hover {
  opacity: 1;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 18px;
}

.field label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: #333;
}

.field select,
.field input {
  width: 100%;
  height: 38px;
  border-radius: 14px;
  border: 1px solid #ddd;
  padding: 0 12px;
  background: #fff;
}

.dates {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dash {
  opacity: 0.6;
}

.segmented {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.seg {
  height: 36px;
  padding: 0 14px;
  border-radius: 16px;
  border: 2px solid #7986cb;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
}
.seg.active {
  background: #7986cb;
  color: #1a1a1a;
}

.filters-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn-primary {
  background: #7986cb;
  border: 2px solid #7986cb;
  padding: 10px 16px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
}
.btn-ghost {
  background: transparent;
  border: 2px solid #ddd;
  padding: 10px 16px;
  border-radius: 16px;
  cursor: pointer;
}

/* INFORMES */
.reports-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.card {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
.card-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
}

.chart-placeholder {
  height: 140px;
  border-radius: 16px;
  background: #6b6b6d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  opacity: 0.8;
}
.chart-placeholder.wide {
  height: 170px;
}

.card-wide {
  margin-top: 16px;
}

.filters-summary {
  margin: 14px 0 0 0;
  font-size: 13px;
  opacity: 0.7;
}

/* EXPORTACIÓN */
.export-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 6px 0;
  justify-content: flex-end;
}

.export-label {
  font-size: 13px;
  opacity: 0.7;
}

.btn-export {
  background: #7986cb;
  border: 2px solid #3949ab70;
  color: #1f1f1f;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.btn-export.secondary {
  background: transparent;
}

/* Responsive */
@media (max-width: 1200px) {
  .header-Centres {
    width: 92%;
    max-width: 92%;
  }
  .reports-grid {
    grid-template-columns: 1fr;
  }
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
