import { getPrisma } from "../dbConn.js";

// SELECT tots els registres historic
export async function getAllHistoric() {
  try {
    const prisma = await getPrisma();
    return await prisma.historic.findMany({
      include: {
        id_institucio_rel: true,
        periode_rel: true,
      },
    });
  } catch (error) {
    throw new Error(`Error al obtenir historic: ${error.message}`);
  }
}

// SELECT historic per institució
export async function getHistoricByInstitucion(idInstitucion) {
  try {
    const prisma = await getPrisma();
    return await prisma.historic.findMany({
      where: {
        id_institucio: parseInt(idInstitucion),
      },
      include: {
        id_institucio_rel: true,
        periode_rel: true,
      },
      orderBy: { id: 'desc' },
    });
  } catch (error) {
    throw new Error(`Error al obtenir historic: ${error.message}`);
  }
}

// INSERT nou registre historic
export async function createHistoric(idInstitucion, periode, assistencia) {
  try {
    const prisma = await getPrisma();
    return await prisma.historic.create({
      data: {
        id_institucio: parseInt(idInstitucion),
        periode: parseInt(periode),
        assistencia: parseFloat(assistencia),
      },
      include: {
        id_institucio_rel: true,
        periode_rel: true,
      },
    });
  } catch (error) {
    throw new Error(`Error al crear historic: ${error.message}`);
  }
}

// DELETE historic
export async function deleteHistoric(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.historic.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al eliminar historic: ${error.message}`);
  }
}
