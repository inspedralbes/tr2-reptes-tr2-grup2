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
      where: { periode: parseInt(periodeId) },
      include: { id_institucio: true, periode_relacio: true },
    });
  } catch (error) {
    throw new Error(
      `Error al obtenir inscripcions per periode: ${error.message}`,
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

    for (const inscripcion of todasInscripciones) {
      let alumnes = JSON.parse(inscripcion.alumnes || "[]");
      let actualizado = false;

      for (let i = 0; i < alumnes.length; i++) {
        if (alumnes[i].TALLER === tallerIdNum) {
          if (inscripcionesAprobadas.includes(inscripcion.id)) {
            alumnes[i].ESTAT = "APROBADA";
          } else {
            alumnes[i].ESTAT = "DENEGADA";
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

export async function procesarInscripcio(selections, docentRef, comentari) {
  try {
    const prisma = await getPrisma();
    const institucioId = 3; // ID de la institució, pot ser dinàmic segons el context
    const periode = 2; // cuando tengamos la opcion de recibir el periodo elegido esto lo cambiare

    const existeEnHistoric = await prisma.historic.findFirst({
      where: { id_institucio: institucioId },
    });
    const primera_vegada = !existeEnHistoric; // true si no existe en Historic

    const alumnes = selections.map(({ tallerId, numAlumnos }) => ({
      TALLER: Number(tallerId),
      QUANTITAT: Number(numAlumnos),
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
