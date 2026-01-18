import { log } from "console";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getInscripcioById } from "./CRUD/Inscripcions.js";
import { getPrisma } from "./dbConn.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const weights = JSON.parse(
  fs.readFileSync(join(__dirname, "../../data/priority_weights.json"), "utf-8")
);

const PRIORITY_WEIGHTS = {
  FIRST_TIME: weights.FIRST_TIME ?? 20,
  ATTENDANCE_RISK: weights.ATTENDANCE_RISK ?? -30,
  DIVERSITY: weights.DIVERSITY ?? 15,
  MIN_ASSIST: weights.MIN_ASSIST ?? 0.8,
  NO_CAPACITY: weights.NO_CAPACITY ?? -30,
  NE: weights.NE ?? 30,
};

let score = 50;
const prisma = await getPrisma();
const tallerId = 1;
const inscripcioId = 3;

// Estructura para guardar el desglose de puntuación
let breakdown = [];

export async function isFirstTime(tallerId, inscripcioId) {
  const inscripcio = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: {
      tallerId: true,
      primera_vegada: true,
    },
  });

  if (inscripcio?.tallerId == tallerId && inscripcio.primera_vegada) {
    score += PRIORITY_WEIGHTS.FIRST_TIME;
    breakdown.push({
      criterio: "Primera vegada",
      puntos: PRIORITY_WEIGHTS.FIRST_TIME,
      aplicat: true,
    });
  } else {
    breakdown.push({
      criterio: "Primera vegada",
      puntos: PRIORITY_WEIGHTS.FIRST_TIME,
      aplicat: false,
    });
  }
}

export async function hasAttendanceRisk(inscripcioId) {
  const idinstitRes = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: { institucio: true },
  });
  const idinstit = idinstitRes?.institucio;
  if (!idinstit) {
    breakdown.push({
      criterio: "Risc d'assistència",
      puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
      aplicat: false,
    });
    return;
  }

  const assist = await prisma.historic.findMany({
    where: { id_institucio: Number(idinstit) },
    select: { assistencia: true },
  });
  if (!assist || assist.length === 0) {
    breakdown.push({
      criterio: "Risc d'assistència",
      puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
      aplicat: false,
    });
    return;
  }

  let suma = 0;
  for (let i = 0; i < assist.length; i++) {
    suma += assist[i].assistencia;
  }

  const porcentaje = suma / assist.length;
  if (porcentaje < PRIORITY_WEIGHTS.MIN_ASSIST) {
    score += PRIORITY_WEIGHTS.ATTENDANCE_RISK;
    breakdown.push({
      criterio: "Risc d'assistència",
      puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
      aplicat: true,
    });
  } else {
    breakdown.push({
      criterio: "Risc d'assistència",
      puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
      aplicat: false,
    });
  }
}

export async function validateCapacity(tallerId, inscripcioId) {
  const capacity = await prisma.tallers.findUnique({
    where: { id: Number(tallerId) },
    select: {
      places_disp: true,
    },
  });
  const sol_insc = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: {
      alumnes: true,
    },
  });
  const alumnesObj = JSON.parse(sol_insc?.alumnes || "[]");
  if (capacity && capacity.places_disp < alumnesObj.QUANTITAT) {
    score += PRIORITY_WEIGHTS.NO_CAPACITY;
    breakdown.push({
      criterio: "Sense capacitat",
      puntos: PRIORITY_WEIGHTS.NO_CAPACITY,
      aplicat: true,
    });
  } else {
    breakdown.push({
      criterio: "Sense capacitat",
      puntos: PRIORITY_WEIGHTS.NO_CAPACITY,
      aplicat: false,
    });
  }
}


     

export async function calcularPuntuacion(inscripcioId, tallerId) {
  score = 50;
  breakdown = [];
  const inscripcio = await getInscripcioById(inscripcioId);

  await isFirstTime(tallerId, inscripcioId);
  await hasAttendanceRisk(inscripcioId);
  await validateCapacity(tallerId, inscripcioId);

  return {
    id: inscripcio.id,
    score: score,
    breakdown: breakdown,
  };
}

// Función para calcular puntuaciones de todas las inscripciones de un taller
export async function calcularPuntuacionesDelTaller(tallerId) {
  try {
    // Obtener todas las inscripciones que incluyen este taller
    const { getInscripciosByTallerId } = await import("./CRUD/Inscripcions.js");
    const inscripciones = await getInscripciosByTallerId(tallerId);

    // Obtener info del taller
    const taller = await prisma.tallers.findUnique({
      where: { id: Number(tallerId) },
      select: {
        places_max: true,
        places_disp: true,
      },
    });

    // Calcular puntuación para cada inscripción y añadir datos de institución
    const inscripcionesConPuntuacion = await Promise.all(
      inscripciones.map(async (insc) => {
        const puntuacion = await calcularPuntuacion(insc.id, tallerId);

        // Obtener nombre de la institución
        const institucion = await prisma.institucions.findUnique({
          where: { id: Number(insc.institucio) },
          select: { nom: true },
        });

        // Parsear alumnos del JSON
        const alumnesData = JSON.parse(insc.alumnes || "[]");
        const alumnesDelTaller = alumnesData.find(
          (a) => a.TALLER === Number(tallerId)
        )?.QUANTITAT || 0;

        return {
          id: insc.id,
          institucion: institucion?.nom || "Desconegut",
          alumnos: alumnesDelTaller,
          puntuacion: puntuacion.score,
          breakdown: puntuacion.breakdown,
        };
      })
    );

    // Ordenar por puntuación descendente
    inscripcionesConPuntuacion.sort((a, b) => b.puntuacion - a.puntuacion);

    // Añadir info de plazas
    return {
      taller: {
        placesMax: taller?.places_max || 0,
        placesDisp: taller?.places_disp || 0,
      },
      inscripciones: inscripcionesConPuntuacion,
    };
  } catch (error) {
    throw new Error(
      `Error al calcular puntuaciones del taller: ${error.message}`
    );
  }
}

const resultado = await calcularPuntuacion(inscripcioId, tallerId);
console.log(resultado);
