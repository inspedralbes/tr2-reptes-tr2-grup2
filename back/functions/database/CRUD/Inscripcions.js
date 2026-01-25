import { getPrisma } from "../dbConn.js";

// SELECT totes les inscripcions
export async function getAllInscripcions() {
  try {
    const prisma = await getPrisma();
    return await prisma.inscripcions.findMany({
      include: { id_institucio: true, periode_relacio: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir inscripcions: ${error.message}`);
  }
}

// SELECT una inscripción por ID
export async function getInscripcioById(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.inscripcions.findUnique({
      where: { id: parseInt(id) },
      include: { id_institucio: true, periode_relacio: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir inscripció: ${error.message}`);
  }
}

// SELECT totes les inscripcions per un periode
export async function getInscripcionsByPeriode(periodeId) {
  try {
    const prisma = await getPrisma();
    return await prisma.inscripcions.findMany({
      where: { periode: Number.parseInt(periodeId) },
      include: { id_institucio: true, periode_relacio: true },
    });
  } catch (error) {
    throw new Error(
      `Error al obtenir inscripcions per periode: ${error.message}`,
    );
  }
}

export async function getInscripcionsStats(inici, fi) {
  try {
    let result = 0;
    const prisma = await getPrisma();
    const inscripcions = await prisma.assistencia.findMany({
      where: {
        dia: {
          gte: new Date(inici),
          lte: new Date(fi),
        },
        autoritzat: true,
      },
    });
    for (inscripcio in inscripcions) {
      result += 1;
    }
    return { count: result };
  } catch (error) {
    throw new Error(
      `Error al obtenir estadístiques d'inscripcions: ${error.message}`,
    );
  }
}

// INSERT nova inscripció
export async function createInscripcio(data) {
  try {
    const prisma = await getPrisma();
    return await prisma.inscripcions.create({
      data,
      include: { id_institucio: true, periode_relacio: true },
    });
  } catch (error) {
    throw new Error(`Error al crear inscripció: ${error.message}`);
  }
}

// UPDATE inscripció
export async function updateInscripcio(data) {
  try {
    const prisma = await getPrisma();
    const { id, ...updateData } = data;
    return await prisma.inscripcions.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { id_institucio: true, periode_relacio: true },
    });
  } catch (error) {
    throw new Error(`Error al actualizar inscripció: ${error.message}`);
  }
}

// DELETE inscripció
export async function deleteInscripcio(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.inscripcions.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al eliminar inscripció: ${error.message}`);
  }
}

// UPDATE estat inscripcions per taller
export async function updateEstatInscripcions(
  inscripcionesAprobadas,
  tallerId,
) {
  try {
    const prisma = await getPrisma();
    const tallerIdNum = Number.parseInt(tallerId);

    // Climent: Aqui tenim que filtrar amb quin periode es... pero de moment ho deixem aixi
    const todasInscripciones = await prisma.inscripcions.findMany();

    // Obtenir dades actuals del taller
    const taller = await prisma.tallers.findUnique({
      where: { id: tallerIdNum },
    });

    if (!taller) {
      throw new Error(`Taller ${tallerIdNum} no encontrado`);
    }

    let placesActualizadas = taller.places_disp;

    for (const inscripcion of todasInscripciones) {
      let alumnes = JSON.parse(inscripcion.alumnes || "[]");
      let actualizado = false;
      let estadoAnterior = null;

      for (let i = 0; i < alumnes.length; i++) {
        if (alumnes[i].TALLER === tallerIdNum) {
          estadoAnterior = alumnes[i].ESTAT;
          if (inscripcionesAprobadas.includes(inscripcion.id)) {
            alumnes[i].ESTAT = "APROBADA";
            // Restar places solo si cambió de estado a APROBADA
            if (estadoAnterior !== "APROBADA") {
              placesActualizadas -= alumnes[i].QUANTITAT || 0;
            }
          } else {
            alumnes[i].ESTAT = "DENEGADA";
            // Sumar places si vuelve de APROBADA a DENEGADA
            if (estadoAnterior === "APROBADA") {
              placesActualizadas += alumnes[i].QUANTITAT || 0;
            }
          }
          actualizado = true;
        }
      }

      if (actualizado) {
        await prisma.inscripcions.update({
          where: { id: inscripcion.id },
          data: { alumnes: JSON.stringify(alumnes) },
        });
      }
    }

    // Asegurar que places_disp no sea negativo
    placesActualizadas = Math.max(0, placesActualizadas);

    // Actualizar places_disp del taller
    await prisma.tallers.update({
      where: { id: tallerIdNum },
      data: { places_disp: placesActualizadas },
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Error al actualizar inscripcions: ${error.message}`);
  }
}

export async function getInscripciosByTallerId(tallerId) {
  try {
    const prisma = await getPrisma();
    const inscripcions = await prisma.inscripcions.findMany({
      include: {
        id_institucio: true,
        periode_relacio: true,
      },
    });

    const resultado = [];

    for (let i = 0; i < inscripcions.length; i++) {
      const inscripcion = inscripcions[i];

      try {
        const alumnes = JSON.parse(inscripcion.alumnes || "[]");

        let encontrado = false;
        for (let j = 0; j < alumnes.length; j++) {
          if (alumnes[j].TALLER === parseInt(tallerId)) {
            encontrado = true;
            break;
          }
        }

        if (encontrado) {
          resultado.push(inscripcion);
        }
      } catch (e) {
        continue;
      }
    }

    return resultado;
  } catch (error) {
    throw new Error(
      `Error al obtenir inscripcions del taller: ${error.message}`,
    );
  }
}
/* ------------------------------- FUNCIONALIDADES ------------------------------ */

export async function procesarInscripcio(
  selections,
  docentRef,
  comentari,
  institucioId,
  periode,
) {
  try {
    const prisma = await getPrisma();

    const existeEnHistoric = await prisma.historic.findFirst({
      where: { id_institucio: institucioId },
    });
    const primera_vegada = !existeEnHistoric; // true si no existe en Historic

    const alumnes = selections.map(({ tallerId, numAlumnos }) => ({
      TALLER: Number(tallerId),
      QUANTITAT: Number(numAlumnos),
      ESTAT: "ESPERA", // Estado inicial por defecto
    }));

    const inscripcio = await createInscripcio({
      institucio: institucioId,
      primera_vegada: primera_vegada,
      periode: periode,
      alumnes: JSON.stringify(alumnes),
      docents_referents: docentRef || null,
      comentari: comentari || null,
    });

    return inscripcio;
  } catch (error) {
    throw new Error(`Error al procesar inscripció: ${error.message}`);
  }
}

// UPDATE autoritzat a totes les inscripcions d'un periode
export async function autorizarInscripcionsPeriode(periodeId) {
  try {
    const prisma = await getPrisma();
    const result = await prisma.inscripcions.updateMany({
      where: { periode: Number.parseInt(periodeId) },
      data: { autoritzat: true },
    });
    return result;
  } catch (error) {
    throw new Error(`Error al autorizar inscripcions: ${error.message}`);
  }
}
