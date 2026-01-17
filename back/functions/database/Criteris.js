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
};

let score = 50;
const prisma = await getPrisma();
const tallerId = 1;
const inscripcioId = 3;

export async function isFirstTime(tallerId, inscripcioId) {
  const inscripcio = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: {
      tallerId: true,
      primera_vegada: true,
    },
  });

  if (inscripcio.tallerId == tallerId && inscripcio.primera_vegada) {
    score += PRIORITY_WEIGHTS.FIRST_TIME;
  }
}

export async function hasAttendanceRisk(inscripcioId) {
  const idinstitRes = await prisma.inscripcions.findUnique({
    where: { id: Number(inscripcioId) },
    select: { institucio: true },
  });
  const idinstit = idinstitRes?.institucio;
  if (!idinstit) return;

  const assist = await prisma.historic.findMany({
    where: { id_institucio: Number(idinstit) },
    select: { assistencia: true },
  });
  if (!assist || assist.length === 0) return;

  let suma = 0;
  for (let i = 0; i < assist.length; i++) {
    suma += assist[i].assistencia;
  }

  const porcentaje = suma / assist.length;
  if (porcentaje < PRIORITY_WEIGHTS.MIN_ASSIST) {
    score += PRIORITY_WEIGHTS.ATTENDANCE_RISK;
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
  const alumnesObj = JSON.parse(sol_insc.alumnes);
  if (capacity.places_disp < alumnesObj.QUANTITAT) {
    score += PRIORITY_WEIGHTS.NO_CAPACITY;
  }
}

export async function calcularPuntuacion(inscripcioId, tallerId) {
  score = 50;
  const inscripcio = await getInscripcioById(inscripcioId);

  await isFirstTime(tallerId, inscripcioId);
  await hasAttendanceRisk(inscripcioId);
  await validateCapacity(tallerId, inscripcioId);

  return {
    id: inscripcio.id,
    score: score,
  };
}

const resultado = await calcularPuntuacion(inscripcioId, tallerId);
console.log(resultado);
//
