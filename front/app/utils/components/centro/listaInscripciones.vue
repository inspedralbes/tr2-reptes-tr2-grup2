<script setup>
import { ref } from "vue";
import SelectorAlumnos from "@/utils/components/centro/desplegableAlumnos.vue";

const cursoExpandido = ref(null);
const toggleDetalles = (id) => {
  cursoExpandido.value = cursoExpandido.value === id ? null : id;
};
const tallers = ref([
  {
    mes: "Septembre",
    diaNum: 23,
    cursos: [
      {
        titulo: "Curs de Vela",
        hora: "15:30",
        imagen: "/img/centro/image.png",
      },
      {
        titulo: "Curs de Teatre",
        hora: "15:30",
        imagen: "/img/centro/image.png",
      },
      {
        titulo: "Curs de Teatre",
        hora: "15:30",
        imagen: "/img/centro/image.png",
      },
      {
        titulo: "Curs de Teatre",
        hora: "15:30",
        imagen: "/img/centro/image.png",
      },
      {
        titulo: "Curs de Teatre",
        hora: "15:30",
        imagen: "/img/centro/image.png",
      },
    ],
  },
  {
    mes: "Octubre",
    diaNum: 17,
    cursos: [
      {
        titulo: "Curs de Carpinteria",
        hora: "16:30",
        imagen: "/img/centro/image.png",
      },
      {
        titulo: "Curs de Cosir",
        hora: "10:00",
        imagen: "/img/centro/image.png",
      },
    ],
  },
]);

const filaActiva = ref(null);

const actualizarPrioridad = (id, isOpen) => {
  filaActiva.value = isOpen ? id : null;
};

const getMesNum = (mes) => {
  const meses = {
    Septembre: "09",
    Octubre: "10",
    Novembre: "11",
    Desembre: "12",
  };
  return meses[mes] || "00";
};
</script>

<template>
  <div id="container">
    <div class="header-lista">
      <button id="btn-filtro">Filtres</button>
      <p>Alumnes</p>
    </div>
    <div class="lista-container">
      <div v-for="(taller, tIdx) in tallers" :key="tIdx" class="seccion-mes">
        <h2 class="mes-titulo">{{ taller.mes }}</h2>

        <div
          v-for="(curso, cIdx) in taller.cursos"
          :key="cIdx"
          class="bloque-curso"
        >
          <div
            class="fila-curso"
            :style="{ zIndex: filaActiva === `${tIdx}-${cIdx}` ? 100 : 1 }"
          >
            <div class="col-titulo">
              <img :src="curso.imagen" class="img-curso" alt="imagen curso" />
            </div>

            <div class="col-info">
              <div class="text-info">
                <span class="texto-titulo">{{ curso.titulo }}</span
                ><br />
                <span class="info-item">
                  <img src="/img/centro/calendar.png" class="icon" />
                  {{ taller.diaNum }}/{{ getMesNum(taller.mes) }}
                  <img src="/img/centro/clock.png" class="icon" />
                  {{ curso.hora }}
                </span>
              </div>
            </div>

            <button
              class="btn-detalls"
              @click="toggleDetalles(`${tIdx}-${cIdx}`)"
            >
              <span
                class="btn-detalls-text"
                :class="{ rotar: cursoExpandido === `${tIdx}-${cIdx}` }"
                >+</span
              >
            </button>

            <div class="desplegable">
              <SelectorAlumnos
                @toggle="
                  (state) => actualizarPrioridad(`${tIdx}-${cIdx}`, state)
                "
              />
            </div>
          </div>

          <Transition name="fade-slide">
            <div
              v-if="cursoExpandido === `${tIdx}-${cIdx}`"
              class="info-desplegable"
            >
              <div class="contenido-detalle">
                <p>
                  <strong>Descripció del curs:</strong> Aquí puedes poner toda
                  la información detallada que quieras mostrar cuando se abra el
                  panel.
                </p>
                <p><strong>Ubicació:</strong> Aula Magna - Edifici B</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- CONTENEDOR PRINCIPAL --- */
#container {
  margin-top: -25px;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #87878779;
  padding: 25px;
  width: 1050px;
  height: 420px; /* Aumentado ligeramente para permitir scroll interno cómodo */
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.308);
}

/* --- HEADER --- */
.header-lista {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 40px;
  margin-bottom: 15px;
  padding-right: 60px;
}

.header-lista p {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

#btn-filtro {
  background-color: #7986cb;
  border: 3px solid #3949ab;
  border-radius: 30px;
  color: #1d1d1d;
  font-weight: bold;
  padding: 6px 18px;
  font-size: 15px;
  cursor: pointer;
}

/* --- LISTA Y SCROLL --- */
.lista-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 20px;
}

.lista-container::-webkit-scrollbar {
  width: 6px;
}

.lista-container::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 10px;
}

.lista-container::-webkit-scrollbar-thumb {
  background: #878787;
  border-radius: 10px;
}

/* --- ESTRUCTURA DE FILAS (COMPACTAS) --- */
.bloque-curso {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px; /* Espacio mínimo entre bloques */
}

.fila-curso {
  display: flex;
  align-items: center;
  height: 110px;
  position: relative;
  width: 100%;
  margin-top: 5px; /* Reducido para compactar */
  margin-bottom: 5px; /* Reducido para compactar */
  transition: 0.3ms;
}

/* --- CÁPSULAS (COLUMNAS) --- */
.col-titulo {
  background-color: #7986cb;
  margin-left: 150px;
  color: #1a1a1a;
  z-index: 3;
  width: 110px;
  height: 110px;
  display: flex;
  border-radius: 1000px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.col-titulo img.img-curso {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.col-info {
  background-color: #9fa8da;
  margin-left: -110px;
  z-index: 2;
  width: 350px;
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-left: 30px;
  border-radius: 250px;
}

.text-info {
  font-weight: bold;
  margin-left: 30%;
  margin-top: 40px;
  font-size: 0.85rem;
}

.btn-detalls {
  background-color: #c5cae9;
  margin-left: -100px;
  z-index: 1;
  width: 140px;
  height: 110px;
  border: none;
  border-radius: 200px;
  cursor: pointer;
  text-align: right;
  padding-right: 25px;
  transition: all 0.3s ease;
}

.btn-detalls:hover {
  background-color: #d2d7f7;
  width: 150px;
}

.btn-detalls-text {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: bold;
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn-detalls-text.rotar {
  transform: rotate(45deg);
}

.desplegable {
  margin-left: auto;
  margin-right: 30px;
  width: 45px;
}

/* --- DESPLEGABLE DE INFORMACIÓN --- */
.info-desplegable {
  margin-left: 153px;
  background-color: #f5f6ff;
  width: 34%;
  margin-top: -60px; /* Solapamiento controlado */
  padding: 50px 20px 15px 40px;
  border-radius: 0 0 30px 30px;
  border: 1px solid #c5cae9;
  z-index: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.contenido-detalle {
  color: #3949ab;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* --- OTROS --- */
.mes-titulo {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 25px 0px 10px 70px;
}

.icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

/* TRANSICIÓN VUE */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
