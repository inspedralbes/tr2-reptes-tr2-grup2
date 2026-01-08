import { log } from "console";
import { getAllInscripcions } from "./CRUD/Inscripcions.js";
import { getPrisma } from "./dbConn.js";

function safeParseAlumnes(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val !== "string") return [val];
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [p];
  } catch (e) {
    console.warn(
      "safeParseAlumnes: JSON.parse failed, returning []",
      e.message
    );
    return [];
  }
}

export async function collectInscripcionsByTaller(tallerId) {
  const todasLasInscripciones = await getAllInscripcions();
  const inscripcionesEncontradas = [];

  for (const inscripcion of todasLasInscripciones) {
    // Normalizar alumnes a array seguro
    const listaAlumnes = safeParseAlumnes(inscripcion.alumnes);

    for (const alumne of listaAlumnes) {
      const tallerVal = Number(alumne?.TALLER);

      if (Number(tallerId) === tallerVal) {
        inscripcionesEncontradas.push({
          inscripcioId: inscripcion.id,
          taller: alumne.TALLER,
        });
      }
    }
  }

  return inscripcionesEncontradas;
}

export async function fechaLimite(tallerId) {
  const inscripciones = await collectInscripcionsByTaller(tallerId);

  // Obtener el valor de admet_insc del taller
  const prisma = await getPrisma();
  const taller = await prisma.tallers.findUnique({
    where: { id: Number(tallerId) },
    select: { id: true, admet_insc: true },
  });
    console.log(taller.admet_insc);

  // Si el taller no admite inscripciones, devolver array vacío
  // Usar comparación estricta con `true` para evitar valores truthy como '0' (string)
  if (taller?.admet_insc !== true) {
    return {
      taller: {
        id: taller?.id ?? Number(tallerId),
        admet_insc: Boolean(taller?.admet_insc),
        
        
      },
      inscripciones: [],
      totalInscripciones: 0,
    };
  }

  return {
    taller: { id: taller.id, admet_insc: Boolean(taller.admet_insc) },
    inscripciones: inscripciones,
    totalInscripciones: inscripciones.length,
  };
}
