import { log } from "console";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getInscripcioById } from "./CRUD/Inscripcions.js";
import { getPrisma } from "./dbConn.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const weights = JSON.parse(
  fs.readFileSync(join(__dirname, "../../data/priority_weights.json"), "utf-8"),
);

const PRIORITY_WEIGHTS = {
  FIRST_TIME: weights.FIRST_TIME ?? 20,
  ATTENDANCE_RISK: weights.ATTENDANCE_RISK ?? -30,
  DIVERSITY: weights.DIVERSITY ?? 15,
  MIN_ASSIST: weights.MIN_ASSIST ?? 0.8,
  NO_CAPACITY: weights.NO_CAPACITY ?? -30,
  NE: weights.NE ?? 30,
};

const prisma = await getPrisma();

export async function isFirstTime(tallerId, inscripcioId) {
  const inscripcio = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: {
      tallerId: true,
      primera_vegada: true,
    },
  });

  const aplicat = inscripcio?.tallerId == tallerId && inscripcio.primera_vegada;
  
  return {
    criterio: "Primera vegada",
    puntos: PRIORITY_WEIGHTS.FIRST_TIME,
    aplicat: aplicat,
    score: aplicat ? PRIORITY_WEIGHTS.FIRST_TIME : 0,
  };
}

export async function hasAttendanceRisk(inscripcioId) {
  const idinstitRes = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: { institucio: true },
  });
  const idinstit = idinstitRes?.institucio;
  
  if (!idinstit) {
    return {
      criterio: "Risc d'assistència",
      puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
      aplicat: false,
      score: 0,
    };
  }

  const assist = await prisma.historic.findMany({
    where: { id_institucio: Number(idinstit) },
    select: { assistencia: true },
  });
  
  if (!assist || assist.length === 0) {
    return {
      criterio: "Risc d'assistència",
      puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
      aplicat: false,
      score: 0,
    };
  }

  let suma = 0;
  for (let i = 0; i < assist.length; i++) {
    suma += assist[i].assistencia;
  }

  const porcentaje = suma / assist.length;
  const aplicat = porcentaje < PRIORITY_WEIGHTS.MIN_ASSIST;
  
  return {
    criterio: "Risc d'assistència",
    puntos: PRIORITY_WEIGHTS.ATTENDANCE_RISK,
    aplicat: aplicat,
    score: aplicat ? PRIORITY_WEIGHTS.ATTENDANCE_RISK : 0,
  };
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
  const alumnesArray = JSON.parse(sol_insc?.alumnes || "[]");
  // Buscar el taller específico en el array
  const alumnesDelTaller = alumnesArray.find(a => a.TALLER === Number(tallerId));
  const quantitat = alumnesDelTaller?.QUANTITAT || 0;
  
  const aplicat = capacity && capacity.places_disp < quantitat;
  
  return {
    criterio: "Sense capacitat",
    puntos: PRIORITY_WEIGHTS.NO_CAPACITY,
    aplicat: aplicat,
    score: aplicat ? PRIORITY_WEIGHTS.NO_CAPACITY : 0,
  };
}

export async function calcularPuntuacion(inscripcioId, tallerId) {
  const inscripcio = await getInscripcioById(inscripcioId);

  const criterios = await Promise.all([
    isFirstTime(tallerId, inscripcioId),
    hasAttendanceRisk(inscripcioId),
    validateCapacity(tallerId, inscripcioId),
  ]);

  const score = 50 + criterios.reduce((sum, c) => sum + c.score, 0);

  // Guardar puntuación en la base de datos
  await prisma.inscripcions.update({
    where: { id: Number(inscripcioId) },
    data: { puntuacio: score },
  });

  return {
    id: inscripcio.id,
    score: score,
    aceptadas: criterios,
  };
}

export async function calcularPuntuacionesDelTaller(tallerId) {
  try {
    const { getInscripciosByTallerId } = await import("./CRUD/Inscripcions.js");
    const inscripciones = await getInscripciosByTallerId(tallerId);

    const taller = await prisma.tallers.findUnique({
      where: { id: Number(tallerId) },
      select: {
        places_max: true,
        places_disp: true,
      },
    });

    const inscripcionesConPuntuacion = await Promise.all(
      inscripciones.map(async (insc) => {
        const puntuacion = await calcularPuntuacion(insc.id, tallerId);

        const institucion = await prisma.institucions.findUnique({
          where: { id: Number(insc.institucio) },
          select: { nom: true },
        });

        const alumnesData = JSON.parse(insc.alumnes || "[]");
        const alumnesDelTaller =
          alumnesData.find((a) => a.TALLER === Number(tallerId)) || {};
        // Extraer QUANTITAT i ESTAT
        const alumnesCount = alumnesDelTaller.QUANTITAT || 0;
        const estatAlumnes = alumnesDelTaller.ESTAT || "ESPERA";

        return {
          id: insc.id,
          institucion: institucion?.nom || "Desconegut",
          alumnos: alumnesCount,
          puntuacion: puntuacion.score,
          aceptadas: puntuacion.aceptadas,
          estat: estatAlumnes,
        };
      }),
    );

    // Ordenar por puntuación descendente
    inscripcionesConPuntuacion.sort((a, b) => b.puntuacion - a.puntuacion);

    return {
      taller: {
        placesMax: taller?.places_max || 0,
        placesDisp: taller?.places_disp || 0,
      },
      inscripciones: inscripcionesConPuntuacion,
    };
  } catch (error) {
    throw new Error(
      `Error al calcular puntuaciones del taller: ${error.message}`,
    );
  }
}
