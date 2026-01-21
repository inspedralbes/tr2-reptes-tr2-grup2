import { getPrisma } from "../dbConn.js";

// SELECT tots els pesos de criteris
export async function getAllCriterisWeights() {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.findMany();
  } catch (error) {
    throw new Error(`Error al obtenir pesos de criteris: ${error.message}`);
  }
}

// SELECT pes de criteri específic
export async function getCriterisWeightById(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.findUnique({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al obtenir pes de criteri: ${error.message}`);
  }
}

// SELECT per nom de criteri
export async function getCriterisWeightByCriterio(criteri) {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.findUnique({
      where: { criteri },
    });
  } catch (error) {
    throw new Error(
      `Error al obtenir pes per criteri ${criteri}: ${error.message}`
    );
  }
}

// UPDATE pes de criteri
export async function updateCriterisWeight(id, newPes) {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.update({
      where: { id: parseInt(id) },
      data: { pes: parseInt(newPes) },
    });
  } catch (error) {
    throw new Error(`Error al actualitzar pes de criteri: ${error.message}`);
  }
}

// SELECT pesos per a un període específic (o globals)
export async function getCriterisWeightsForPeriod(periodeId) {
  try {
    const prisma = await getPrisma();
    // Obtenir pesos globals i específics del període
    const weights = await prisma.criterisWeights.findMany({
      where: {
        OR: [
          { periode: null }, // Pesos globals
          { periode: parseInt(periodeId) }, // Pesos específics del període
        ],
      },
    });
    return weights;
  } catch (error) {
    throw new Error(
      `Error al obtenir pesos per al període: ${error.message}`
    );
  }
}
